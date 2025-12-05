import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

export interface Booking {
  rowIndex: number
  bookingName: string
  contactNumber: string
  year: string
  january: number
  february: number
  march: number
  april: number
  may: number
  june: number
  july: number
  august: number
  september: number
  october: number
  november: number
  december: number
}

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
]

async function getDoc() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  })

  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEET_ID!,
    serviceAccountAuth
  )

  await doc.loadInfo()
  return doc
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const doc = await getDoc()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()

    const bookings: Booking[] = rows.map((row, index) => ({
      rowIndex: index + 2, // +2 because row 1 is header, and rows are 1-indexed
      bookingName: row.get('Booking Name') || '',
      contactNumber: row.get('Contact Number') || '',
      year: row.get('Year') || '',
      january: parseInt(row.get('January') || '0'),
      february: parseInt(row.get('February') || '0'),
      march: parseInt(row.get('March') || '0'),
      april: parseInt(row.get('April') || '0'),
      may: parseInt(row.get('May') || '0'),
      june: parseInt(row.get('June') || '0'),
      july: parseInt(row.get('July') || '0'),
      august: parseInt(row.get('August') || '0'),
      september: parseInt(row.get('September') || '0'),
      october: parseInt(row.get('October') || '0'),
      november: parseInt(row.get('November') || '0'),
      december: parseInt(row.get('December') || '0'),
    }))

    return bookings
  } catch (error) {
    console.error('Error fetching bookings:', error)
    throw error
  }
}

export async function addBooking(booking: Omit<Booking, 'rowIndex'>): Promise<void> {
  try {
    const doc = await getDoc()
    const sheet = doc.sheetsByIndex[0]
    
    await sheet.addRow({
      'Booking Name': booking.bookingName,
      'Contact Number': booking.contactNumber,
      'Year': booking.year,
      'January': booking.january,
      'February': booking.february,
      'March': booking.march,
      'April': booking.april,
      'May': booking.may,
      'June': booking.june,
      'July': booking.july,
      'August': booking.august,
      'September': booking.september,
      'October': booking.october,
      'November': booking.november,
      'December': booking.december,
    })
  } catch (error) {
    console.error('Error adding booking:', error)
    throw error
  }
}

export async function updateBooking(rowIndex: number, booking: Omit<Booking, 'rowIndex'>): Promise<void> {
  try {
    const doc = await getDoc()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()
    
    const row = rows[rowIndex - 2] // -2 because rows are 0-indexed and first row is header
    
    if (row) {
      row.set('Booking Name', booking.bookingName)
      row.set('Contact Number', booking.contactNumber)
      row.set('Year', booking.year)
      row.set('January', booking.january)
      row.set('February', booking.february)
      row.set('March', booking.march)
      row.set('April', booking.april)
      row.set('May', booking.may)
      row.set('June', booking.june)
      row.set('July', booking.july)
      row.set('August', booking.august)
      row.set('September', booking.september)
      row.set('October', booking.october)
      row.set('November', booking.november)
      row.set('December', booking.december)
      
      await row.save()
    }
  } catch (error) {
    console.error('Error updating booking:', error)
    throw error
  }
}

export async function deleteBooking(rowIndex: number): Promise<void> {
  try {
    const doc = await getDoc()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()
    
    const row = rows[rowIndex - 2]
    
    if (row) {
      await row.delete()
    }
  } catch (error) {
    console.error('Error deleting booking:', error)
    throw error
  }
}