import { Course, BlogPost, SiteSettings, CustomCategory, SiteResource } from '../types';

export interface SyncPayload {
  token: string;
  repo: string;
  courses: Course[];
  blogPosts: BlogPost[];
  siteSettings: SiteSettings;
  categories: CustomCategory[];
  resources: SiteResource[];
  onProgress?: (status: string) => void;
}

export interface TestConnectionResult {
  ok: boolean;
  message: string;
  repoName?: string;
  defaultBranch?: string;
  canPush?: boolean;
}

/**
 * Safely encodes a UTF-8 string to Base64 in modern browser environments
 */
export function toBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Validates GitHub Personal Access Token and repository access
 */
export async function testGithubConnection(token: string, repo: string): Promise<TestConnectionResult> {
  const cleanToken = token.trim();
  const cleanRepo = repo.trim();

  if (!cleanToken) {
    return { ok: false, message: 'GitHub Personal Access Token দেওয়া হয়নি।' };
  }
  if (!cleanRepo || !cleanRepo.includes('/')) {
    return { ok: false, message: 'সঠিক রিপোজিটরি দিন (যেমন: mhims/10ms-Course-Shop)।' };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${cleanRepo}`, {
      headers: {
        Authorization: `token ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 401) {
      return {
        ok: false,
        message: 'GitHub Token সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে। দয়া করে নতুন Personal Access Token দিন।',
      };
    }
    if (res.status === 404) {
      return {
        ok: false,
        message: `রিপোজিটরি "${cleanRepo}" পাওয়া যায়নি। রিপোর নাম ঠিক আছে কিনা এবং টোকেনে রিপো এক্সেস পারমিশন আছে কিনা চেক করুন।`,
      };
    }
    if (res.status === 403) {
      const err = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: `GitHub এক্সেস লিমিট বা পারমিশন সমস্যা: ${err.message || 'টোকেনের পারমিশন চেক করুন'}`,
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        message: `GitHub API রেসপন্স কোড: ${res.status}`,
      };
    }

    const data = await res.json();
    const canPush = data.permissions ? Boolean(data.permissions.push) : true;

    if (!canPush) {
      return {
        ok: false,
        canPush: false,
        repoName: data.full_name,
        defaultBranch: data.default_branch,
        message: 'টোকেনটি সঠিক, কিন্তু এই রিপোজিটরিতে কোড বা ফাইল লেখার (Write/Push) পারমিশন নেই। টোকেন বানানোর সময় "repo" স্কোপ নির্বাচন করুন।',
      };
    }

    return {
      ok: true,
      canPush: true,
      repoName: data.full_name,
      defaultBranch: data.default_branch || 'main',
      message: `সংযোগ সফল! রিপোজিটরি: ${data.full_name} (${data.default_branch || 'main'})`,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `নেটওয়ার্ক সমস্যা: ${err.message || 'GitHub-এর সাথে কানেক্ট করা যাচ্ছে না'}`,
    };
  }
}

/**
 * Pushes complete dataset to GitHub using atomic Git Trees API
 * Falls back to Contents API if Git Trees API encounters issues
 */
export async function pushDataToGithub({
  token,
  repo,
  courses,
  blogPosts,
  siteSettings,
  categories,
  resources,
  onProgress,
}: SyncPayload): Promise<{ success: boolean; commitUrl?: string; message: string }> {
  const cleanToken = token.trim();
  const cleanRepo = repo.trim();

  if (!cleanToken) {
    throw new Error('দয়া করে আপনার GitHub Personal Access Token দিন!');
  }
  if (!cleanRepo || !cleanRepo.includes('/')) {
    throw new Error('দয়া করে সঠিক রিপোজিটরি দিন (যেমন: mhims/10ms-Course-Shop)');
  }

  // 1. Persist to local dev server disk immediately (in AI Studio)
  try {
    fetch('/api/save-courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courses }),
    }).catch(() => {});
    fetch('/api/save-blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogs: blogPosts }),
    }).catch(() => {});
  } catch {
    // Ignore local API errors on static host
  }

  onProgress?.('রিপোজিটরির বর্তমান অবস্থা যাচাই করা হচ্ছে...');

  const headers = {
    Authorization: `token ${cleanToken}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // 2. Fetch repo information to get the default branch
  const repoRes = await fetch(`https://api.github.com/repos/${cleanRepo}`, { headers });
  if (repoRes.status === 401) {
    throw new Error('GitHub Token সঠিক নয় বা মেয়াদোত্তীর্ণ! দয়া করে সঠিক টোকেন প্রদান করুন।');
  }
  if (repoRes.status === 404) {
    throw new Error(`রিপোজিটরি "${cleanRepo}" পাওয়া যায়নি! রিপোজিটরির নাম চেক করুন।`);
  }
  if (!repoRes.ok) {
    const err = await repoRes.json().catch(() => ({}));
    throw new Error(err.message || `GitHub সংযোগ ত্রুটি (${repoRes.status})`);
  }

  const repoData = await repoRes.json();
  const branch = repoData.default_branch || 'main';

  // Always stamp the latest timestamp so visitors' browsers know there is fresh data
  const nowTimestamp = Date.now();
  const syncedSettings: SiteSettings = {
    ...siteSettings,
    lastUpdated: nowTimestamp,
  };

  // Prepare files to sync (both root and docs/ so any GitHub Pages configuration works)
  const files = [
    { name: 'courses.json', content: JSON.stringify(courses, null, 2) },
    { name: 'blogs.json', content: JSON.stringify(blogPosts, null, 2) },
    { name: 'settings.json', content: JSON.stringify(syncedSettings, null, 2) },
    { name: 'categories.json', content: JSON.stringify(categories, null, 2) },
    { name: 'resources.json', content: JSON.stringify(resources, null, 2) },
  ];

  // Try Strategy A: Git Trees API (1 single atomic commit for all files)
  try {
    onProgress?.(`গিটহাব ব্রাঞ্চ "${branch}" থেকে হেড পয়েন্টার আনা হচ্ছে...`);
    const refRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/ref/heads/${branch}`, { headers });
    if (!refRes.ok) {
      throw new Error(`Failed to get ref for branch ${branch}`);
    }
    const refData = await refRes.json();
    const baseCommitSha = refData.object.sha;

    const commitRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/commits/${baseCommitSha}`, { headers });
    if (!commitRes.ok) {
      throw new Error(`Failed to get base commit ${baseCommitSha}`);
    }
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    onProgress?.('সকল কোর্সের ডেটা ও ফাইলের ট্রি তৈরি করা হচ্ছে...');

    // Build tree entries: both root and docs/ paths so site works regardless of GitHub Pages folder setting
    const treeEntries: Array<{ path: string; mode: string; type: string; content: string }> = [];
    for (const f of files) {
      treeEntries.push({
        path: f.name,
        mode: '100644',
        type: 'blob',
        content: f.content,
      });
      treeEntries.push({
        path: `docs/${f.name}`,
        mode: '100644',
        type: 'blob',
        content: f.content,
      });
    }

    // Always maintain custom domain CNAME and .nojekyll
    treeEntries.push({ path: 'CNAME', mode: '100644', type: 'blob', content: '10mscourse.shop\n' });
    treeEntries.push({ path: 'docs/CNAME', mode: '100644', type: 'blob', content: '10mscourse.shop\n' });
    treeEntries.push({ path: '.nojekyll', mode: '100644', type: 'blob', content: '' });
    treeEntries.push({ path: 'docs/.nojekyll', mode: '100644', type: 'blob', content: '' });

    // Note: Do NOT touch or overwrite compiled assets (app.js, app.css, index.html) during data sync.
    // Git Trees API with base_tree safely preserves all existing production build assets intact.

    const treeRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeEntries,
      }),
    });

    if (!treeRes.ok) {
      const err = await treeRes.json().catch(() => ({}));
      throw new Error(err.message || 'Git Trees তৈরি করতে সমস্যা হয়েছে');
    }
    const treeData = await treeRes.json();
    const newTreeSha = treeData.sha;

    onProgress?.('গিটহাবে একক কমিট তৈরি ও পাঠানো হচ্ছে...');
    const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newCommitRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: `Update site data from 10MS Admin Panel - ${nowStr}`,
        tree: newTreeSha,
        parents: [baseCommitSha],
      }),
    });

    if (!newCommitRes.ok) {
      const err = await newCommitRes.json().catch(() => ({}));
      throw new Error(err.message || 'Git Commit তৈরি করতে সমস্যা হয়েছে');
    }
    const newCommitData = await newCommitRes.json();
    const newCommitSha = newCommitData.sha;

    onProgress?.(`ব্রাঞ্চ "${branch}" আপডেট করা হচ্ছে...`);
    const updateRefRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitSha,
        force: false,
      }),
    });

    if (!updateRefRes.ok) {
      const err = await updateRefRes.json().catch(() => ({}));
      throw new Error(err.message || 'Git Branch Ref আপডেট করতে সমস্যা হয়েছে');
    }

    // Mark sync completed in browser storage
    try {
      localStorage.setItem('10ms_shop_remote_last_updated', nowTimestamp.toString());
      localStorage.removeItem('10ms_shop_local_modified_at');
    } catch {
      // ignore
    }

    const commitUrl = `https://github.com/${cleanRepo}/commit/${newCommitSha}`;
    return {
      success: true,
      commitUrl,
      message: `আলহামদুলিল্লাহ! সম্পূর্ণ সাইটের ডেটা এক ক্লিকে সফলভাবে পুশ সম্পন্ন হয়েছে (Commit: ${newCommitSha.slice(0, 7)})।`,
    };
  } catch (treeError: any) {
    console.warn('Git Trees API failed, attempting Contents API fallback:', treeError);
    onProgress?.('Contents API-র মাধ্যমে ফাইল পুশ করা হচ্ছে...');

    // Strategy B: Fallback Contents API with safety throttling and SHA resolution
    for (const file of files) {
      const targets = [`docs/${file.name}`, file.name];
      const base64Content = toBase64Utf8(file.content);

      for (const targetPath of targets) {
        onProgress?.(`আপলোড হচ্ছে: ${targetPath}...`);
        const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${targetPath}`;
        let sha: string | undefined = undefined;

        try {
          const getRes = await fetch(apiUrl, {
            headers: {
              Authorization: `token ${cleanToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
            cache: 'no-store',
          });
          if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
          }
        } catch {
          // File may not exist yet
        }

        // Small pause to prevent secondary rate limit
        await new Promise((r) => setTimeout(r, 250));

        let putRes = await fetch(apiUrl, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `Update ${file.name} from 10MS Admin Panel`,
            content: base64Content,
            sha,
          }),
        });

        // If 409 conflict, retry once with fresh SHA
        if (putRes.status === 409) {
          await new Promise((r) => setTimeout(r, 600));
          try {
            const retryGet = await fetch(apiUrl, {
              headers: {
                Authorization: `token ${cleanToken}`,
                Accept: 'application/vnd.github.v3+json',
              },
              cache: 'no-store',
            });
            if (retryGet.ok) {
              const fileData = await retryGet.json();
              sha = fileData.sha;
              putRes = await fetch(apiUrl, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                  message: `Update ${file.name} from 10MS Admin Panel (retry)`,
                  content: base64Content,
                  sha,
                }),
              });
            }
          } catch {
            // ignore retry
          }
        }

        if (!putRes.ok && targetPath === file.name) {
          const errData = await putRes.json().catch(() => ({}));
          throw new Error(errData.message || `${targetPath} আপলোডে ব্যর্থ হয়েছে (${putRes.status})`);
        }
      }
    }

    try {
      localStorage.setItem('10ms_shop_remote_last_updated', nowTimestamp.toString());
      localStorage.removeItem('10ms_shop_local_modified_at');
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'আলহামদুলিল্লাহ! সম্পূর্ণ সাইটের ডেটা সফলভাবে পুশ সম্পন্ন হয়েছে।',
    };
  }
}
