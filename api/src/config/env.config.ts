import dotenv from 'dotenv'
import process from 'node:process'
import { Document, Types } from 'mongoose'
import { CookieOptions } from 'express'
import * as bookcarsTypes from 'bookcars-types'
import * as Helper from '../common/Helper'

dotenv.config({ path: './.env.development' })

/**
 * Get environment variable value.
 *
 * @param {string} name
 * @param {?boolean} [required]
 * @param {?string} [defaultValue]
 * @returns {string}
 */
const __env__ = (name: string, required?: boolean, defaultValue?: string): string => {
    const value = process.env[name]
    if (required && !value) {
        throw new Error(`'${name} not found`)
    }
    if (!value) {
        return defaultValue || ''
    }
    return String(value)
}

/**
 * Server Port. Default is 4002.
 *
 * @type {number}
 */
export const PORT = Number.parseInt(__env__('BC_PORT', false, '4002'), 10)

/**
 * Indicate whether HTTPS is enabled or not.
 *
 * @type {boolean}
 */
export const HTTPS = Helper.StringToBoolean(__env__('BC_HTTPS'))

/**
 * Private SSL key filepath.
 *
 * @type {string}
 */
export const PRIVATE_KEY = __env__('BC_PRIVATE_KEY', HTTPS)

/**
 * Private SSL certificate filepath.
 *
 * @type {string}
 */
export const CERTIFICATE = __env__('BC_CERTIFICATE', HTTPS)

/**
 * MongoDB database URI. Default is: mongodb://127.0.0.1:27017/bookcars?authSource=admin&appName=bookcars
 *
 * @type {string}
 */
export const DB_URI = __env__('BC_DB_URI', false, 'mongodb://127.0.0.1:27017/bookcars?authSource=admin&appName=bookcars')

/**
 * Indicate whether MongoDB SSL is enabled or not.
 *
 * @type {boolean}
 */
export const DB_SSL = Helper.StringToBoolean(__env__('BC_DB_SSL', false, 'false'))

/**
 * MongoDB SSL certificate filepath.
 *
 * @type {string}
 */
export const DB_SSL_CERT = __env__('BC_DB_SSL_CERT', DB_SSL)

/**
 * MongoDB SSL CA certificate filepath.
 *
 * @type {string}
 */
export const DB_SSL_CA = __env__('BC_DB_SSL_CA', DB_SSL)

/**
 * Indicate whether MongoDB debug is enabled or not.
 *
 * @type {boolean}
 */
export const DB_DEBUG = Helper.StringToBoolean(__env__('BC_DB_DEBUG', false, 'false'))

/**
 * Cookie secret. It should at least be 32 characters long, but the longer the better.
 *
 * @type {string}
 */
export const COOKIE_SECRET = __env__('BC_COOKIE_SECRET', false, 'BookCars')

/**
 * Authentication cookie domain.
 * Default is localhost.
 *
 * @type {string}
 */
export const AUTH_COOKIE_DOMAIN = __env__('BC_AUTH_COOKIE_DOMAIN', false, 'localhost')

/**
 * Cookie options.
 *
 * On production, authentication cookies are httpOnly, signed, secure and strict sameSite.
 * This will prevent XSS attacks by not allowing access to the cookie via JavaScript.
 * This will prevent CSRF attacks by not allowing the browser to send the cookie along with cross-site requests.
 * This will prevent MITM attacks by only allowing the cookie to be sent over HTTPS.
 * Authentication cookies are protected against XST attacks as well by disabling TRACE HTTP method via allowedMethods middleware.
 *
 * @type {CookieOptions}
 */
export const COOKIE_OPTIONS: CookieOptions = { httpOnly: true, signed: true, sameSite: 'strict', domain: AUTH_COOKIE_DOMAIN }

/**
 * frontend authentication cookie name.
 *
 * @type {"bc-x-access-token-frontend"}
 */
export const FRONTEND_AUTH_COOKIE_NAME = 'bc-x-access-token-frontend'

/**
 * Backend authentication cookie name.
 *
 * @type {"bc-x-access-token-backend"}
 */
export const BACKEND_AUTH_COOKIE_NAME = 'bc-x-access-token-backend'

/**
 * JWT secret. It should at least be 32 characters long, but the longer the better.
 *
 * @type {string}
 */
export const JWT_SECRET = __env__('BC_JWT_SECRET', false, 'BookCars')

/**
 * JWT expiration in seconds. Dedault is 86400 seconds (1 day).
 *
 * @type {number}
 */
export const JWT_EXPIRE_AT = Number.parseInt(__env__('BC_JWT_EXPIRE_AT', false, '86400'), 10)

/**
 * Validation Token expiration in seconds. Dedault is 86400 seconds (1 day).
 *
 * @type {number}
 */
export const TOKEN_EXPIRE_AT = Number.parseInt(__env__('BC_TOKEN_EXPIRE_AT', false, '86400'), 10)

/**
 * SMTP host.
 *
 * @type {string}
 */
export const SMTP_HOST = __env__('BC_SMTP_HOST', false, 'in-v3.mailjet.com')

/**
 * SMTP port.
 *
 * @type {number}
 */
export const SMTP_PORT = Number.parseInt(__env__('BC_SMTP_PORT', false, '587'), 10)

/**
 * SMTP username.
 *
 * @type {string}
 */
export const SMTP_USER = __env__('BC_SMTP_USER', false, 'USER')

/**
 * SMTP password.
 *
 * @type {string}
 */
export const SMTP_PASS = __env__('BC_SMTP_PASS', false, 'PASSWORD')

/**
 * SMTP from email.
 *
 * @type {string}
 */
export const SMTP_FROM = __env__('BC_SMTP_FROM', false, 'admin@bookcars.com')

/**
 * Users' cdn folder path.
 *
 * @type {string}
 */
export const CDN_USERS = __env__('BC_CDN_USERS', false, '../../../cdn/bookcars/users')

/**
 * Users' temp cdn folder path.
 *
 * @type {string}
 */
export const CDN_TEMP_USERS = __env__('BC_CDN_TEMP_USERS', false, '../../../cdn/bookcars/temp/users')

/**
 * Cars' cdn folder path.
 *
 * @type {string}
 */
export const CDN_CARS = __env__('BC_CDN_CARS', false, '../../../cdn/bookcars/cars')

/**
 * Cars' temp cdn folder path.
 *
 * @type {string}
 */
export const CDN_TEMP_CARS = __env__('BC_CDN_TEMP_CARS', false, '../../../cdn/bookcars/temp/cars')

/**
 * Backend host.
 *
 * @type {string}
 */
export const BACKEND_HOST = __env__('BC_BACKEND_HOST', false, 'http://localhost:3001/')

/**
 * Frontend host.
 *
 * @type {string}
 */
export const FRONTEND_HOST = __env__('BC_FRONTEND_HOST', false, 'http://localhost:3002/')

/**
 * Default language. Default is en. Available options: en, fr.
 *
 * @type {string}
 */
export const DEFAULT_LANGUAGE = __env__('BC_DEFAULT_LANGUAGE', false, 'en')

/**
 * Default Minimum age for rental. Default is 21 years.
 *
 * @type {number}
 */
export const MINIMUM_AGE = Number.parseInt(__env__('BC_MINIMUM_AGE', false, '21'), 10)

/**
 * Expo push access token.
 *
 * @type {string}
 */
export const EXPO_ACCESS_TOKEN = __env__('BC_EXPO_ACCESS_TOKEN', false)

/**
 * User Document.
 *
 * @export
 * @interface User
 * @typedef {User}
 * @extends {Document}
 */
export interface User extends Document {
    company?: Types.ObjectId
    fullName: string
    email: string
    phone?: string
    password?: string
    birthDate?: Date
    verified?: boolean
    verifiedAt?: Date
    active?: boolean
    language: string
    enableEmailNotifications?: boolean
    avatar?: string
    bio?: string
    location?: string
    type?: bookcarsTypes.UserType
    blacklisted?: boolean
    payLater?: boolean
}

/**
 * UserInfo.
 *
 * @export
 * @interface UserInfo
 * @typedef {UserInfo}
 */
export interface UserInfo {
    _id?: Types.ObjectId
    company?: Types.ObjectId
    fullName: string
    email?: string
    phone?: string
    password?: string
    birthDate?: Date
    verified?: boolean
    verifiedAt?: Date
    active?: boolean
    language?: string
    enableEmailNotifications?: boolean
    avatar?: string
    bio?: string
    location?: string
    type?: string
    blacklisted?: boolean
    payLater?: boolean
}

/**
 * AdditionalDriver.
 *
 * @export
 * @interface AdditionalDriver
 * @typedef {AdditionalDriver}
 */
export interface AdditionalDriver {
    fullName: string
    email: string
    phone: string
    birthDate: Date
}

/**
 * Booking Document.
 *
 * @export
 * @interface Booking
 * @typedef {Booking}
 * @extends {Document}
 */
export interface Booking extends Document {
    _id: Types.ObjectId
    company: Types.ObjectId
    car: Types.ObjectId
    driver: Types.ObjectId
    pickupLocation: Types.ObjectId
    dropOffLocation: Types.ObjectId
    from: Date
    to: Date
    status: bookcarsTypes.BookingStatus
    cancellation?: boolean
    amendments?: boolean
    theftProtection?: boolean
    collisionDamageWaiver?: boolean
    fullInsurance?: boolean
    additionalDriver?: boolean
    _additionalDriver?: Types.ObjectId
    cancelRequest?: boolean
    price: number
}

/**
 * Car Document.
 *
 * @export
 * @interface Car
 * @typedef {Car}
 * @extends {Document}
 */
export interface Car extends Document {
    name: string
    company: Types.ObjectId
    minimumAge: number
    locations: Types.ObjectId[]
    price: number
    deposit: number
    available: boolean
    type: bookcarsTypes.CarType
    gearbox: bookcarsTypes.GearboxType
    aircon: boolean
    image: string | null
    seats: number
    doors: number
    fuelPolicy: bookcarsTypes.FuelPolicy
    mileage: number
    cancellation: number
    amendments: number
    theftProtection: number
    collisionDamageWaiver: number
    fullInsurance: number
    additionalDriver: number
}

/**
 * CarInfo.
 *
 * @export
 * @interface CarInfo
 * @typedef {CarInfo}
 */
export interface CarInfo {
    _id?: Types.ObjectId
    name: string
    company: UserInfo
    minimumAge: number
    locations: Types.ObjectId[]
    price: number
    deposit: number
    available: boolean
    type: bookcarsTypes.CarType
    gearbox: bookcarsTypes.GearboxType
    aircon: boolean
    image?: string
    seats: number
    doors: number
    fuelPolicy: bookcarsTypes.FuelPolicy
    mileage: number
    cancellation: number
    amendments: number
    theftProtection: number
    collisionDamageWaiver: number
    fullInsurance: number
    additionalDriver: number
}

/**
 * BookingInfo.
 *
 * @export
 * @interface BookingInfo
 * @typedef {BookingInfo}
 */
export interface BookingInfo {
    _id?: Types.ObjectId
    company: UserInfo
    car: Car
    driver: UserInfo
    pickupLocation: Types.ObjectId
    dropOffLocation: Types.ObjectId
    from: Date
    to: Date
    status: bookcarsTypes.BookingStatus
    cancellation?: boolean
    amendments?: boolean
    theftProtection?: boolean
    collisionDamageWaiver?: boolean
    fullInsurance?: boolean
    additionalDriver?: boolean
    _additionalDriver?: Types.ObjectId
    cancelRequest?: boolean
    price: number
}

/**
 * Location Document.
 *
 * @export
 * @interface Location
 * @typedef {Location}
 * @extends {Document}
 */
export interface Location extends Document {
    values: Types.ObjectId[]
    name?: string
}

/**
 * LocationValue Document.
 *
 * @export
 * @interface LocationValue
 * @typedef {LocationValue}
 * @extends {Document}
 */
export interface LocationValue extends Document {
    language: string
    value: string
}

/**
 *LocationInfo.
 *
 * @export
 * @interface LocationInfo
 * @typedef {LocationInfo}
 */
export interface LocationInfo {
    _id?: Types.ObjectId
    name?: string
    values: LocationValue[]
}

/**
 * Notification Document.
 *
 * @export
 * @interface Notification
 * @typedef {Notification}
 * @extends {Document}
 */
export interface Notification extends Document {
    user: Types.ObjectId
    message: string
    booking: Types.ObjectId
    isRead?: boolean
}

/**
 * NotificationCounter Document.
 *
 * @export
 * @interface NotificationCounter
 * @typedef {NotificationCounter}
 * @extends {Document}
 */
export interface NotificationCounter extends Document {
    user: Types.ObjectId
    count?: number
}

/**
 * PushNotification Document.
 *
 * @export
 * @interface PushNotification
 * @typedef {PushNotification}
 * @extends {Document}
 */
export interface PushNotification extends Document {
    user: Types.ObjectId
    token: string
}

/**
 * Token Document.
 *
 * @export
 * @interface Token
 * @typedef {Token}
 * @extends {Document}
 */
export interface Token extends Document {
    user: Types.ObjectId
    token: string
    expireAt?: Date
}
