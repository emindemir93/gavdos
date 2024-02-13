import { Schema, model } from 'mongoose'
import { Decimal128 } from 'mongodb'
import * as env from '../config/env.config'

const discountSchema = new Schema<env.Discount>(
  {
    minDay: {
      type: Number,
      required: [true, "can't be blank"],
    },
    maxDay: {
      type: Number,
      required: [true, "can't be blank"],
    },
    isActive: {
      type: Boolean,
      required: [true, "can't be blank"],
    },
    factor: {
      type: Decimal128,
      required: [true, "can't be blank"],
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'DayRangeDiscount',
  },
)

const discountModel = model<env.Discount>('DayRangeDiscount', discountSchema)

discountModel.on('index', (err) => {
  if (err) {
    console.error('Discount index error: %s', err)
  } else {
    console.info('Discount indexing complete')
  }
})

export default discountModel
