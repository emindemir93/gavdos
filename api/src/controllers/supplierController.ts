import path from 'node:path'
import fs from 'node:fs/promises'
import escapeStringRegexp from 'escape-string-regexp'
import { Request, Response } from 'express'
import * as bookcarsTypes from 'bookcars-types'
import strings from '../config/app.config'
import * as env from '../config/env.config'
import User from '../models/User'
import NotificationCounter from '../models/NotificationCounter'
import Notification from '../models/Notification'
import AdditionalDriver from '../models/AdditionalDriver'
import Booking from '../models/Booking'
import Car from '../models/Car'
import * as Helper from '../common/Helper'

/**
 * Validate Supplier by fullname.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function validate(req: Request, res: Response) {
  const { body }: { body: bookcarsTypes.ValidateSupplierPayload } = req
  const { fullName } = body

  try {
    const keyword = escapeStringRegexp(fullName)
    const options = 'i'
    const user = await User.findOne({
      type: bookcarsTypes.UserType.Company,
      fullName: { $regex: new RegExp(`^${keyword}$`), $options: options },
    })
    return user ? res.sendStatus(204) : res.sendStatus(200)
  } catch (err) {
    console.error(`[supplier.validate] ${strings.DB_ERROR} ${fullName}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

/**
 * Update Supplier.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function update(req: Request, res: Response) {
  const { body }: { body: bookcarsTypes.UpdateSupplierPayload } = req
  const { _id } = body

  try {
    const supplier = await User.findById(_id)

    if (supplier) {
      const {
        fullName,
        phone,
        location,
        bio,
        payLater,
      } = body
      supplier.fullName = fullName
      supplier.phone = phone
      supplier.location = location
      supplier.bio = bio
      supplier.payLater = payLater

      await supplier.save()
      return res.sendStatus(200)
    }
    console.error('[supplier.update] Supplier not found:', _id)
    return res.sendStatus(204)
  } catch (err) {
    console.error(`[supplier.update] ${strings.DB_ERROR} ${_id}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

/**
 * Delete Supplier by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function deleteSupplier(req: Request, res: Response) {
  const { id } = req.params

  try {
    const supplier = await User.findById(id)
    if (supplier) {
      await User.deleteOne({ _id: id })

      if (supplier.avatar) {
        const avatar = path.join(env.CDN_USERS, supplier.avatar)
        if (await Helper.exists(avatar)) {
          await fs.unlink(avatar)
        }

        await NotificationCounter.deleteMany({ user: id })
        await Notification.deleteMany({ user: id })
        const additionalDrivers = (await Booking.find({ company: id, _additionalDriver: { $ne: null } }, { _id: 0, _additionalDriver: 1 })).map((b) => b._additionalDriver)
        await AdditionalDriver.deleteMany({ _id: { $in: additionalDrivers } })
        await Booking.deleteMany({ company: id })
        const cars = await Car.find({ company: id })
        await Car.deleteMany({ company: id })
        for (const car of cars) {
          if (car.image) {
            const image = path.join(env.CDN_CARS, car.image)
            if (await Helper.exists(image)) {
              await fs.unlink(image)
            }
          }
        }
      }
    } else {
      return res.sendStatus(404)
    }
    return res.sendStatus(200)
  } catch (err) {
    console.error(`[supplier.delete] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

/**
 * Get Supplier by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function getSupplier(req: Request, res: Response) {
  const { id } = req.params

  try {
    const user = await User.findById(id).lean()

    if (!user) {
      console.error('[supplier.getSupplier] Supplier not found:', id)
      return res.sendStatus(204)
    }
    const {
      _id,
      email,
      fullName,
      avatar,
      phone,
      location,
      bio,
      payLater,
    } = user

    return res.json({
      _id,
      email,
      fullName,
      avatar,
      phone,
      location,
      bio,
      payLater,
    })
  } catch (err) {
    console.error(`[supplier.getSupplier] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

/**
 * Get Suppliers.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function getSuppliers(req: Request, res: Response) {
  try {
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'

    const data = await User.aggregate(
      [
        {
          $match: {
            type: bookcarsTypes.UserType.Company,
            fullName: { $regex: keyword, $options: options },
          },
        },
        {
          $facet: {
            resultData: [{ $sort: { fullName: 1 } }, { $skip: (page - 1) * size }, { $limit: size }],
            pageInfo: [
              {
                $count: 'totalRecords',
              },
            ],
          },
        },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    if (data.length > 0) {
      data[0].resultData = data[0].resultData.map((supplier: env.User) => {
        const { _id, fullName, avatar } = supplier
        return { _id, fullName, avatar }
      })
    }

    return res.json(data)
  } catch (err) {
    console.error(`[supplier.getSuppliers] ${strings.DB_ERROR} ${req.query.s}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

/**
 * Get all Suppliers.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function getAllSuppliers(req: Request, res: Response) {
  try {
    let data = await User.aggregate(
      [
        { $match: { type: bookcarsTypes.UserType.Company } },
        { $sort: { fullName: 1 } },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    if (data.length > 0) {
      data = data.map((supplier) => {
        const { _id, fullName, avatar } = supplier
        return { _id, fullName, avatar }
      })
    }

    return res.json(data)
  } catch (err) {
    console.error(`[supplier.getAllSuppliers] ${strings.DB_ERROR}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}
