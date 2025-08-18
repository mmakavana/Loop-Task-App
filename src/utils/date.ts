import { format, parseISO, isSameDay, startOfDay, addDays } from 'date-fns'
export const toISODate=(d:Date)=>format(d,'yyyy-MM-dd')
export const fromISODate=(s:string)=>parseISO(s+'T00:00:00')
export const addLocalDays=(d:Date,n:number)=>addDays(d,n)
export const isSameISO=(a:string,b:string)=>isSameDay(fromISODate(a),fromISODate(b))
