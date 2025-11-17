interface Contact {
  name?: string
  email: string
  phone?: string
}

export function parseCSV(csvContent: string): Contact[] {
  const lines = csvContent.trim().split('\n')
  const contacts: Contact[] = []

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const columns = line.split(',').map(col => col.trim())

    const contact: Contact = {
      name: columns[0] || undefined,
      email: columns[1],
      phone: columns[2] || undefined
    }

    // Validate email
    if (contact.email && validateEmail(contact.email)) {
      contacts.push(contact)
    }
  }

  return contacts
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateCSVTemplate(): string {
  return 'name,email,phone\nJohn Doe,john@example.com,+1234567890\nJane Smith,jane@example.com,'
}
