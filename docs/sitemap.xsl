<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="bn">
      <head>
        <title>XML Sitemap | 10MS Course Shop</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon-48x48.png" />
        <style type="text/css">
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 30px 20px; }
          .container { max-width: 1200px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.06); overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%); color: #ffffff; padding: 32px 36px; }
          .header h1 { margin: 0 0 8px 0; font-size: 26px; font-weight: 700; }
          .header p { margin: 0; font-size: 14px; opacity: 0.92; line-height: 1.5; }
          .info-bar { background: #fff1f2; border-bottom: 1px solid #ffe4e6; padding: 16px 36px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #9f1239; }
          .badge { background: #e11d48; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 12px; }
          .table-container { overflow-x: auto; padding: 20px 36px 36px 36px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background-color: #f1f5f9; color: #475569; text-align: left; padding: 12px 16px; font-weight: 600; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 11px; }
          td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
          tr:hover td { background-color: #f8fafc; }
          a { color: #e11d48; text-decoration: none; font-weight: 500; }
          a:hover { text-decoration: underline; }
          .footer { padding: 20px 36px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XML Sitemap | 10MS Course Shop</h1>
            <p>This Yoast-compatible XML Sitemap is crawled by Google, Bing, Yahoo, ChatGPT, Gemini, Perplexity, and Claude to discover 10 Minute School courses, discounts, and admission links.</p>
          </div>
          <div class="info-bar">
            <div>Structured Search &amp; Generative AI Index: Canonical URLs, Google Images &amp; Timestamps</div>
            <div>Total Indexed URLs: <span class="badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span></div>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>URL / ওয়েব ঠিকানা</th>
                  <th style="width: 100px;">Images (ছবি)</th>
                  <th style="width: 100px;">Frequency</th>
                  <th style="width: 80px;">Priority</th>
                  <th style="width: 140px;">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td><xsl:value-of select="position()"/></td>
                    <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="count(image:image) &gt; 0">
                          <span style="background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                            <xsl:value-of select="count(image:image)"/> img
                          </span>
                        </xsl:when>
                        <xsl:otherwise><span style="color: #94a3b8;">-</span></xsl:otherwise>
                      </xsl:choose>
                    </td>
                    <td style="color: #475569; text-transform: capitalize;"><xsl:value-of select="sitemap:changefreq"/></td>
                    <td style="font-weight: 600;"><xsl:value-of select="sitemap:priority"/></td>
                    <td style="color: #64748b; font-family: monospace;"><xsl:value-of select="sitemap:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
          <div class="footer">Visit Website: <a href="https://10mscourse.shop/">10mscourse.shop</a> - ১০ মিনিট স্কুল কোর্স ও অফার</div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>