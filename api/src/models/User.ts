import validator from 'validator'
import { Schema, model } from 'mongoose'
import * as bookcarsTypes from 'bookcars-types'
import * as env from '../config/env.config'

const userSchema = new Schema<env.User>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      validate: [validator.isEmail, 'is not valid'],
      index: true,
      trim: true,
    },
    phone: {
      type: String,
      validate: {
        validator: (value: string) => {
          // Check if value is empty then return true.
          if (!value) {
            return true
          }

          // If value is empty will not validate for mobile phone.
          return validator.isMobilePhone(value)
        },
        message: '{VALUE} is not valid',
      },
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "can't be blank"],
      index: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    birthDate: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: false,
    },
    language: {
      // ISO 639-1 (alpha-2 code)
      type: String,
      default: env.DEFAULT_LANGUAGE,
      lowercase: true,
      minlength: 2,
      maxlength: 2,
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 100,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        bookcarsTypes.UserType.Admin,
        bookcarsTypes.UserType.Company,
        bookcarsTypes.UserType.User,
      ],
      default: bookcarsTypes.UserType.User,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
    payLater: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'User',
  },
)

const userModel = model<env.User>('User', userSchema)

userModel.on('index', (err) => {
  if (err) {
    console.error('User index error: %s', err)
  } else {
    console.info('User indexing complete')
  }
})

export default userModel
