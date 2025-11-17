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
  creativeUrl: string,
  uniqueLink: string,
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
    <div style="background-color: #000000; color: #ffffff; padding: 30px 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">${campaignName}</h1>
    </div>

    <!-- Body -->
    <div style="padding: 30px 20px;">
      <div style="white-space: pre-wrap; line-height: 1.6; color: #333333;">
        ${body.replace(/\n/g, '<br>')}
      </div>
    </div>

    <!-- Creative Preview -->
    <div style="padding: 20px; text-align: center; background-color: #f9f9f9;">
      <h3 style="margin: 0 0 15px 0; color: #333333;">Your Shareable Creative</h3>
      <img src="${creativeUrl}"
           style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;"
           alt="Shareable creative" />
      <a href="${creativeUrl}"
         style="display: inline-block; background-color: #007bff; color: #ffffff;
                padding: 12px 30px; text-decoration: none; border-radius: 4px;
                font-weight: bold;">
        Download Creative
      </a>
    </div>

    <!-- Unique Link -->
    <div style="padding: 30px 20px; background-color: #f0f8ff;">
      <p style="margin: 0 0 15px 0; font-weight: bold; text-align: center; color: #333333;">
        Your Unique Referral Link:
      </p>
      <div style="background-color: #ffffff; padding: 15px; border-radius: 4px;
                  text-align: center; border: 2px dashed #007bff;">
        <code style="font-size: 14px; color: #007bff; word-break: break-all;">
          ${uniqueLink}
        </code>
      </div>
      <p style="margin: 15px 0 0 0; text-align: center; font-size: 12px; color: #666666;">
        Copy this link and share it on your social media
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 30px 20px; text-align: center; color: #666666; font-size: 12px;
                background-color: #f5f5f5;">
      <p style="margin: 0;">Questions? Just reply to this email.</p>
    </div>

  </div>
</body>
</html>
  `.trim()
}
