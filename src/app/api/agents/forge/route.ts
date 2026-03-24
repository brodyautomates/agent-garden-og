import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { landingPageCopy, clientName, industry } = await req.json();

    // Step 1: Generate HTML with Claude
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: 'You are Forge, an AI agent that builds landing pages. Return ONLY the complete HTML — no markdown, no code fences, no explanation. Just the raw HTML starting with <!DOCTYPE html>.',
      messages: [{
        role: 'user',
        content: `Build a complete, self-contained landing page HTML file for "${clientName}" (${industry}).

Use this copy:
- Headline: ${landingPageCopy.headline}
- Subheadline: ${landingPageCopy.subheadline}
- Bullets: ${JSON.stringify(landingPageCopy.bullets)}
- CTA Button: ${landingPageCopy.ctaText}
- CTA Subtext: ${landingPageCopy.ctaSubtext}
- Social Proof: ${JSON.stringify(landingPageCopy.socialProof)}
- Hero Description: ${landingPageCopy.heroDescription}
- Objection Handlers: ${JSON.stringify(landingPageCopy.objectionHandlers)}

Requirements:
- Single HTML file with ALL CSS inline in a <style> tag (no external stylesheets)
- Dark theme (#0a0a0f background, white text, #00ff88 accent color)
- Modern, clean design with good spacing
- Responsive (works on mobile)
- Include: hero section, benefits section, social proof, objection handling FAQ, CTA section, footer
- Use Inter or system font stack
- Include meta viewport tag
- Make it look professional and conversion-optimized`,
      }],
    });

    let html = response.content[0].type === 'text' ? response.content[0].text : '';

    // Strip markdown code fences if present
    html = html.replace(/```html?\n?/g, '').replace(/```\n?/g, '').trim();

    // Step 2: Deploy to Vercel
    let deployUrl: string | null = null;
    try {
      const vercelToken = process.env.VERCEL_TOKEN;
      if (vercelToken) {
        const projectName = `forge-${clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

        const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: projectName,
            files: [
              {
                file: 'index.html',
                data: Buffer.from(html).toString('base64'),
                encoding: 'base64',
              },
            ],
            projectSettings: {
              framework: null,
            },
          }),
        });

        if (deployRes.ok) {
          const deployData = await deployRes.json();
          deployUrl = `https://${deployData.url}`;
        } else {
          console.error('Vercel deploy failed:', await deployRes.text());
        }
      }
    } catch (deployError) {
      console.error('Vercel deploy error:', deployError);
    }

    return NextResponse.json({
      html,
      deployUrl,
      cssFramework: 'inline',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Forge error:', error);
    return NextResponse.json({ error: 'Forge failed to build page' }, { status: 500 });
  }
}
