import { Schema, model } from 'mongoose'
import * as bookcarsTypes from 'bookcars-types'
import * as env from '../config/env.config'

const carSchema = new Schema<env.Car>(
  {
    name: {
      type: String,
      required: [true, "can't be blank"],
      index: true,
      trim: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
    },
    minimumAge: {
      type: Number,
      required: [true, "can't be blank"],
      min: env.MINIMUM_AGE,
      max: 99,
    },
    locations: {
      type: [Schema.Types.ObjectId],
      ref: 'Location',
      validate: (value: any): boolean => Array.isArray(value) && value.length > 0,
    },
    price: {
      type: Number,
      required: [true, "can't be blank"],
    },
    deposit: {
      type: Number,
      required: [true, "can't be blank"],
    },
    available: {
      type: Boolean,
      required: [true, "can't be blank"],
      index: true,
    },
    type: {
      type: String,
      enum: [bookcarsTypes.CarType.Diesel, bookcarsTypes.CarType.Gasoline],
      required: [true, "can't be blank"],
    },
    gearbox: {
      type: String,
      enum: [bookcarsTypes.GearboxType.Manual, bookcarsTypes.GearboxType.Automatic],
      required: [true, "can't be blank"],
    },
    aircon: {
      type: Boolean,
      required: [true, "can't be blank"],
    },
    image: {
      type: String,
    },
    seats: {
      type: Number,
      required: [true, "can't be blank"],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer',
      },
    },
    doors: {
      type: Number,
      required: [true, "can't be blank"],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer',
      },
    },
    fuelPolicy: {
      type: String,
      enum: [bookcarsTypes.FuelPolicy.LikeForlike, bookcarsTypes.FuelPolicy.FreeTank],
      required: [true, "can't be blank"],
    },
    mileage: {
      type: Number,
      required: [true, "can't be blank"],
    },
    cancellation: {
      type: Number,
      required: [true, "can't be blank"],
    },
    amendments: {
      type: Number,
      required: [true, "can't be blank"],
    },
    theftProtection: {
      type: Number,
      required: [true, "can't be blank"],
    },
    collisionDamageWaiver: {
      type: Number,
      required: [true, "can't be blank"],
    },
    fullInsurance: {
      type: Number,
      required: [true, "can't be blank"],
    },
    additionalDriver: {
      type: Number,
      required: [true, "can't be blank"],
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'Car',
  },
)

const carModel = model<env.Car>('Car', carSchema)

carModel.on('index', (err) => {
  if (err) {
    console.error('Car index error: %s', err)
  } else {
    console.info('Car indexing complete')
  }
})

export default carModel
