interface EmailVariables {
  name?: string
  link: string
  event: string
}

export function renderEmailTemplate(
  template: string,
  variables: EmailVariables
): string {
  let rendered = template

  // Replace name if available, otherwise remove the {name} placeholder
  if (variables.name) {
    rendered = rendered.replace(/{name}/g, variables.name)
  } else {
    // Remove {name} and any "Hi " or "Hello " that might precede it
    rendered = rendered.replace(/Hi {name},?\s*/gi, '')
    rendered = rendered.replace(/Hello {name},?\s*/gi, '')
    rendered = rendered.replace(/{name}/g, '')
  }

  // Replace other variables
  rendered = rendered.replace(/{link}/g, variables.link)
  rendered = rendered.replace(/{event}/g, variables.event)

  return rendered
}

export function buildEmailHtml(
  body: string,
  sharePageUrl: string,
  campaignName: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaignName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 40px 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${campaignName}</h1>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px;">
      <div style="white-space: pre-wrap; line-height: 1.8; color: #333333; font-size: 16px;">
        ${body.replace(/\n/g, '<br>')}
      </div>
    </div>

    <!-- Main CTA -->
    <div style="padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%);">
      <h2 style="margin: 0 0 10px 0; color: #333333; font-size: 22px;">Share This Event!</h2>
      <p style="margin: 0 0 30px 0; color: #666666; font-size: 14px;">
        Get your exclusive shareable creative and referral link
      </p>

      <!-- Big Share Button -->
      <a href="${sharePageUrl}"
         style="display: inline-block; background: linear-gradient(135deg, #E1306C 0%, #C13584 50%, #833AB4 100%);
                color: #ffffff; padding: 18px 50px; text-decoration: none; border-radius: 30px;
                font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(225, 48, 108, 0.4);">
        📸 Share to Instagram Story
      </a>

      <p style="margin: 20px 0 0 0; color: #999999; font-size: 13px;">
        Tap to get your creative and unique link
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 30px 20px; text-align: center; color: #666666; font-size: 12px;
                background-color: #f5f5f5; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0 0 10px 0;">Share with friends and earn rewards!</p>
      <p style="margin: 0;">Questions? Just reply to this email.</p>
    </div>

  </div>
</body>
</html>
  `.trim()
}
