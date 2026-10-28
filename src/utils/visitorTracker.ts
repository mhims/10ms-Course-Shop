/**
 * Real-Time Visitor Tracker for 10 Minute School Course Shop
 * Sends visitor telemetry (IP, location, device, OS, time spent, referrer, page)
 * to the owner's Google Sheet via Google Apps Script Web App.
 */

interface VisitorPayload {
  action: 'visit' | 'updateTime';
  visitId: string;
  time?: string;
  page?: string;
  ip?: string;
  location?: string;
  device?: string;
  os?: string;
  browser?: string;
  timeSpent?: string;
  referrer?: string;
  resolution?: string;
}

let currentVisitId: string = '';
let visitStartTime: number = Date.now();
let heartbeatTimer: any = null;
let lastKnownLocation: { ip: string; location: string } | null = null;

// Convert seconds into readable Bengali time format (matching screenshot)
export function formatBengaliTimeSpent(totalSeconds: number): string {
  if (totalSeconds < 1) return '১ সেকেন্ড';
  if (totalSeconds < 60) return `${totalSeconds} সেকেন্ড`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes < 60) {
    return seconds > 0 ? `${minutes} মিনিট ${seconds} সেকেন্ড` : `${minutes} মিনিট`;
  }

  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return remMinutes > 0 ? `${hours} ঘণ্টা ${remMinutes} মিনিট` : `${hours} ঘণ্টা`;
}

// Detect Device Type
function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop / PC';
}

// Detect Operating System
function detectOS(): string {
  const ua = navigator.userAgent;
  if (/Windows NT 10.0|Windows NT 11.0/i.test(ua)) return 'Windows 10/11';
  if (/Windows NT 6.3/i.test(ua)) return 'Windows 8.1';
  if (/Windows NT 6.2/i.test(ua)) return 'Windows 8';
  if (/Windows NT 6.1/i.test(ua)) return 'Windows 7';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Linux/i.test(ua)) return 'Linux';
  if (/CrOS/i.test(ua)) return 'ChromeOS';
  return 'অন্যান্য OS';
}

// Detect Browser
function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/SamsungBrowser/i.test(ua)) return 'Samsung Internet';
  if (/Edg/i.test(ua)) return 'Edge';
  if (/OPR|Opera/i.test(ua)) return 'Opera';
  if (/Chrome/i.test(ua)) return 'Chrome';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  return 'ব্রাউজার';
}

// Resolve IP and Location asynchronously
async function resolveIpAndLocation(): Promise<{ ip: string; location: string }> {
  if (lastKnownLocation) return lastKnownLocation;

  // Try sessionStorage cache first to prevent quota exhaustion
  try {
    const cached = sessionStorage.getItem('10ms_visitor_geo');
    if (cached) {
      lastKnownLocation = JSON.parse(cached);
      return lastKnownLocation!;
    }
  } catch (e) {}

  try {
    // 1. Try ipapi.co (provides both IP and Country/City)
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      const ip = data.ip || '103.171.251.14';
      const city = data.city || '';
      const country = data.country_name || 'Bangladesh';
      const location = city ? `${city}, ${country}` : country;
      lastKnownLocation = { ip, location };
      sessionStorage.setItem('10ms_visitor_geo', JSON.stringify(lastKnownLocation));
      return lastKnownLocation;
    }
  } catch (e) {
    // Fallback: Try freeipapi.com
    try {
      const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        const ip = data.ipAddress || '';
        const city = data.cityName || '';
        const country = data.countryName || 'Bangladesh';
        const location = city ? `${city}, ${country}` : country;
        lastKnownLocation = { ip: ip || 'স্বয়ংক্রিয়', location };
        sessionStorage.setItem('10ms_visitor_geo', JSON.stringify(lastKnownLocation));
        return lastKnownLocation;
      }
    } catch (err) {}
  }

  return { ip: 'স্বয়ংক্রিয়', location: 'Bangladesh' };
}

// Send data to Google Apps Script Web App
function sendToGoogleSheet(scriptUrl: string, payload: VisitorPayload) {
  if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/macros/s/')) {
    return;
  }

  try {
    const jsonString = JSON.stringify(payload);
    // Use navigator.sendBeacon if available for leave/unload events
    if (payload.action === 'updateTime' && navigator.sendBeacon) {
      const blob = new Blob([jsonString], { type: 'text/plain;charset=UTF-8' });
      navigator.sendBeacon(scriptUrl, blob);
      return;
    }

    // Standard POST fetch
    fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script requires no-cors for direct client posts
      headers: { 'Content-Type': 'text/plain' },
      body: jsonString,
      keepalive: true,
    }).catch(() => {});
  } catch (err) {
    // Silent fail so visitor experience is unaffected
  }
}

export const DEFAULT_GOOGLE_SHEET_URL =
  'https://script.google.com/macros/s/AKfycbxzH4EobS7UwuDn22TJnHy4-oZYiD_xCiatW5LW8rALUL4DkLyPbpJn9wqqwhn8IsBL/exec';

/**
 * Main Track Visitor Function - called on route change
 */
export async function trackVisitorPageView(
  pageName: string,
  scriptUrlOverride?: string
) {
  // Do not track admin panels or local bot runs
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (path.includes('admin') || path.includes('adminpanelofficial')) return;

  // Retrieve script URL from settings or local storage
  const scriptUrl =
    scriptUrlOverride ||
    localStorage.getItem('10ms_sheet_tracker_url') ||
    DEFAULT_GOOGLE_SHEET_URL;

  if (!scriptUrl) {
    return;
  }

  // Clear previous heartbeat timer
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  // Create new unique visit ID for this pageview
  currentVisitId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  visitStartTime = Date.now();

  // Format Date and Time in Asia/Dhaka or user locale
  const now = new Date();
  const timeFormatted = now.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const device = detectDevice();
  const os = detectOS();
  const browser = detectBrowser();
  const resolution = `${window.screen.width}x${window.screen.height}`;
  const rawRef = document.referrer;
  const referrer = rawRef && !rawRef.includes(window.location.host) ? rawRef : 'সরাসরি (Direct)';

  // Initial Geo info
  const geo = await resolveIpAndLocation();

  // 1. Send Initial Entry Row
  const initialPayload: VisitorPayload = {
    action: 'visit',
    visitId: currentVisitId,
    time: timeFormatted,
    page: pageName || 'হোমপেজ (Home)',
    ip: geo.ip,
    location: geo.location,
    device,
    os,
    browser,
    timeSpent: 'সক্রিয় রয়েছে (Active)...',
    referrer,
    resolution,
  };

  sendToGoogleSheet(scriptUrl, initialPayload);

  // 2. Set up Heartbeat to update Time Spent every 20 seconds
  heartbeatTimer = setInterval(() => {
    if (!currentVisitId) return;
    const elapsedSecs = Math.max(1, Math.floor((Date.now() - visitStartTime) / 1000));
    sendToGoogleSheet(scriptUrl, {
      action: 'updateTime',
      visitId: currentVisitId,
      timeSpent: formatBengaliTimeSpent(elapsedSecs),
    });
  }, 20000);

  // 3. Final update on tab close / route leave
  const handlePageLeave = () => {
    if (!currentVisitId) return;
    const elapsedSecs = Math.max(1, Math.floor((Date.now() - visitStartTime) / 1000));
    sendToGoogleSheet(scriptUrl, {
      action: 'updateTime',
      visitId: currentVisitId,
      timeSpent: formatBengaliTimeSpent(elapsedSecs),
    });
  };

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      handlePageLeave();
    }
  });
  window.addEventListener('beforeunload', handlePageLeave);
}

/**
 * Apps Script Code Template to give to the user
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * 10 Minute School Course - Google Sheet Visitor Tracker
 * 
 * ব্যবহারের নিয়ম:
 * ১. আপনার গুগল ড্রাইভে একটি নতুন Google Sheet তৈরি করুন।
 * ২. গুগল শিটের ওপরে Extensions > Apps Script-এ ক্লিক করুন।
 * ৩. আগের সব কোড মুছে নিচের সম্পূর্ণ কোডটি পেস্ট করুন।
 * ৪. উপরে ডানপাশে "Deploy" > "New deployment" বাটনে ক্লিক করুন।
 * ৫. Select type (গিয়ার আইকন) থেকে "Web app" বেছে নিন।
 * ৬. "Who has access" ড্রপডাউন থেকে অবশ্যই "Anyone" (যেকেউ) সিলেক্ট করুন।
 * ৭. "Deploy" বাটনে ক্লিক করে তৈরি হওয়া Web App URL-টি কপি করে ওয়েবসাইটের অ্যাডমিন প্যানেলে বসিয়ে দিন।
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // ১. প্রথম সারির হেডার চেক ও তৈরি (যদি না থাকে)
    setupHeadersIfMissing(sheet);

    var action = data.action || 'visit';

    // ২. নতুন ভিজিটর এন্ট্রি (action === 'visit')
    if (action === 'visit') {
      var rowData = [
        data.time || Utilities.formatDate(new Date(), "Asia/Dhaka", "M/d/yyyy, h:mm:ss a"),
        data.page || 'হোমপেজ (Home)',
        data.ip || 'স্বয়ংক্রিয়',
        data.location || 'বাংলাদেশ',
        data.device || 'Desktop / PC',
        data.os || 'Windows 10/11',
        data.browser || 'Chrome',
        data.timeSpent || 'সক্রিয় রয়েছে (Active)...',
        data.referrer || 'সরাসরি (Direct)',
        data.resolution || '1920x1080',
        data.visitId || '' // কলাম ১১ (লুকানো আইডি যা সময় আপডেট করতে কাজে লাগে)
      ];

      sheet.appendRow(rowData);

      // নতুন সারির অ্যালাইনমেন্ট ও ফরম্যাটিং
      var lastRow = sheet.getLastRow();
      var range = sheet.getRange(lastRow, 1, 1, 10);
      range.setVerticalAlignment("middle");
      range.setFontFamily("Arial");
      range.setFontSize(10);

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', row: lastRow }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ৩. সাইটে থাকার সময় আপডেট (action === 'updateTime')
    if (action === 'updateTime' && data.visitId) {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        // নিচ থেকে উপরে সার্চ করা যাতে দ্রুত আপডেট হয়
        var idRange = sheet.getRange(2, 11, lastRow - 1, 1).getValues();
        for (var i = idRange.length - 1; i >= 0; i--) {
          if (idRange[i][0] === data.visitId) {
            var targetRow = i + 2;
            sheet.getRange(targetRow, 8).setValue(data.timeSpent || '১ সেকেন্ড');
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'updated' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ignored' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return doPost(e);
}

// হেডার তৈরি ও সুন্দর রঙ দিয়ে সাজানো
function setupHeadersIfMissing(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      'তারিখ ও সময় (Time)',
      'পেজ (Page)',
      'আইপি (IP)',
      'লোকেশন (Location)',
      'ডিভাইস (Device)',
      'অপারেটিং সিস্টেম (OS)',
      'ব্রাউজার (Browser)',
      'সাইটে থাকার সময় (Time Spent)',
      'কোথা থেকে এসেছে (Referrer)',
      'স্ক্রিন রেজুলেশন (Screen Resolution)',
      'Session_ID'
    ];

    sheet.appendRow(headers);

    // হেডার ডিজাইন (ডার্ক নেভি ব্লু ব্যাকগ্রাউন্ড ও সাদা বোল্ড টেক্সট)
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0f172a");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    headerRange.setFontSize(11);
    sheet.setRowHeight(1, 35);
    sheet.hideColumns(11); // Session_ID কলামটি শিটে লুকিয়ে রাখা

    // কলাম সাইজ অ্যাডজাস্টমেন্ট
    sheet.setColumnWidth(1, 180); // সময়
    sheet.setColumnWidth(2, 200); // পেজ
    sheet.setColumnWidth(3, 140); // আইপি
    sheet.setColumnWidth(4, 160); // লোকেশন
    sheet.setColumnWidth(5, 130); // ডিভাইস
    sheet.setColumnWidth(6, 150); // ওএস
    sheet.setColumnWidth(7, 120); // ব্রাউজার
    sheet.setColumnWidth(8, 180); // সময়
    sheet.setColumnWidth(9, 240); // রেফারার
    sheet.setColumnWidth(10, 140); // রেজুলেশন
  }
}
`;
