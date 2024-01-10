import fs from 'node:fs/promises'
import path from 'node:path'
import { v1 as uuid } from 'uuid'
import escapeStringRegexp from 'escape-string-regexp'
import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as bookcarsTypes from 'bookcars-types'
import Booking from '../models/Booking'
import Car from '../models/Car'
import strings from '../config/app.config'
import * as env from '../config/env.config'
import * as Helper from '../common/Helper'

/**
 * Create a Car.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function create(req: Request, res: Response) {
  const { body }: { body: bookcarsTypes.CreateCarPayload } = req

  try {
    if (!body.image) {
      console.error(`[car.create] ${strings.CAR_IMAGE_REQUIRED} ${body}`)
      return res.status(400).send(strings.CAR_IMAGE_REQUIRED)
    }

    const car = new Car(body)
    await car.save()

    if (car.image) {
      if (!(await Helper.exists(env.CDN_CARS))) {
        await fs.mkdir(env.CDN_CARS, { recursive: true })
      }

      const image = path.join(env.CDN_TEMP_CARS, body.image)

      if (await Helper.exists(image)) {
        const filename = `${car._id}_${Date.now()}${path.extname(body.image)}`
        const newPath = path.join(env.CDN_CARS, filename)

        await fs.rename(image, newPath)
        car.image = filename
        await car.save()
      } else {
        await Car.deleteOne({ _id: car._id })
        console.error(strings.CAR_IMAGE_NOT_FOUND, body)
        return res.status(400).send(strings.CAR_IMAGE_NOT_FOUND)
      }
    }

    return res.json(car)
  } catch (err) {
    console.error(`[car.create] ${strings.DB_ERROR} ${body}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

/**
 * Update a Car.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function update(req: Request, res: Response) {
  const { body }: { body: bookcarsTypes.UpdateCarPayload } = req
  const { _id } = body

  try {
    const car = await Car.findById(_id)

    if (car) {
      const {
        company,
        name,
        minimumAge,
        available,
        type,
        locations,
        price,
        deposit,
        seats,
        doors,
        aircon,
        gearbox,
        fuelPolicy,
        mileage,
        cancellation,
        amendments,
        theftProtection,
        collisionDamageWaiver,
        fullInsurance,
        additionalDriver,
      } = body

      car.company = new mongoose.Types.ObjectId(company)
      car.minimumAge = minimumAge
      car.locations = locations.map((l) => new mongoose.Types.ObjectId(l))
      car.name = name
      car.available = available
      car.type = type as bookcarsTypes.CarType
      car.price = price
      car.deposit = deposit
      car.seats = seats
      car.doors = doors
      car.aircon = aircon
      car.gearbox = gearbox as bookcarsTypes.GearboxType
      car.fuelPolicy = fuelPolicy as bookcarsTypes.FuelPolicy
      car.mileage = mileage
      car.cancellation = cancellation
      car.amendments = amendments
      car.theftProtection = theftProtection
      car.collisionDamageWaiver = collisionDamageWaiver
      car.fullInsurance = fullInsurance
      car.additionalDriver = additionalDriver

      await car.save()
      return res.sendStatus(200)
    }
    console.error('[car.update] Car not found:', _id)
    return res.sendStatus(204)
  } catch (err) {
    console.error(`[car.update] ${strings.DB_ERROR} ${_id}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

/**
 * Check if a Car is related to bookings.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function checkCar(req: Request, res: Response) {
  const { id } = req.params

  try {
    const _id = new mongoose.Types.ObjectId(id)
    const count = await Booking
      .find({ car: _id })
      .limit(1)
      .countDocuments()

    if (count === 1) {
      return res.sendStatus(200)
    }

    return res.sendStatus(204)
  } catch (err) {
    console.error(`[car.check] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

/**
 * Delete a Car by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function deleteCar(req: Request, res: Response) {
  const { id } = req.params

  try {
    const car = await Car.findById(id)
    if (car) {
      await Car.deleteOne({ _id: id })

      if (car.image) {
        const image = path.join(env.CDN_CARS, car.image)
        if (await Helper.exists(image)) {
          await fs.unlink(image)
        }
      }
      await Booking.deleteMany({ car: car._id })
    } else {
      return res.sendStatus(404)
    }
    return res.sendStatus(200)
  } catch (err) {
    console.error(`[car.delete] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

/**
 * Upload a Car image to temp folder.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function createImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      const msg = '[car.createImage] req.file not found'
      console.error(msg)
      return res.status(400).send(msg)
    }

    if (!(await Helper.exists(env.CDN_TEMP_CARS))) {
      await fs.mkdir(env.CDN_TEMP_CARS, { recursive: true })
    }

    const filename = `${Helper.getFilenameWithoutExtension(req.file.originalname)}_${uuid()}_${Date.now()}${path.extname(req.file.originalname)}`
    const filepath = path.join(env.CDN_TEMP_CARS, filename)

    await fs.writeFile(filepath, req.file.buffer)
    return res.json(filename)
  } catch (err) {
    console.error(`[car.createImage] ${strings.DB_ERROR}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

/**
 * Update a Car image.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function updateImage(req: Request, res: Response) {
  const { id } = req.params

  try {
    if (!req.file) {
      const msg = '[car.updateImage] req.file not found'
      console.error(msg)
      return res.status(400).send(msg)
    }

    const { file } = req

    const car = await Car.findById(id)

    if (car) {
      if (!(await Helper.exists(env.CDN_CARS))) {
        await fs.mkdir(env.CDN_CARS, { recursive: true })
      }

      if (car.image) {
        const image = path.join(env.CDN_CARS, car.image)
        if (await Helper.exists(image)) {
          await fs.unlink(image)
        }
      }

      const filename = `${car._id}_${Date.now()}${path.extname(file.originalname)}`
      const filepath = path.join(env.CDN_CARS, filename)

      await fs.writeFile(filepath, file.buffer)
      car.image = filename
      await car.save()
      return res.sendStatus(200)
    }
    console.error('[car.updateImage] Car not found:', id)
    return res.sendStatus(204)
  } catch (err) {
    console.error(`[car.updateImage] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

/**
 * Delete a Car image.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function deleteImage(req: Request, res: Response) {
  const { id } = req.params

  try {
    const car = await Car.findById(id)

    if (car) {
      if (car.image) {
        const image = path.join(env.CDN_CARS, car.image)
        if (await Helper.exists(image)) {
          await fs.unlink(image)
        }
      }
      car.image = null

      await car.save()
      return res.sendStatus(200)
    }
    console.error('[car.deleteImage] Car not found:', id)
    return res.sendStatus(204)
  } catch (err) {
    console.error(`[car.deleteImage] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

/**
 * Delete a temp Car image.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {*}
 */
export async function deleteTempImage(req: Request, res: Response) {
  const { image } = req.params

  try {
    const imageFile = path.join(env.CDN_TEMP_CARS, image)
    if (await Helper.exists(imageFile)) {
      await fs.unlink(imageFile)
    }

    res.sendStatus(200)
  } catch (err) {
    console.error(`[car.deleteTempImage] ${strings.DB_ERROR} ${image}`, err)
    res.status(400).send(strings.ERROR + err)
  }
}

/**
 * Get a Car by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function getCar(req: Request, res: Response) {
  const { id, language } = req.params

  try {
    const car = await Car.findById(id)
      .populate<{ company: env.UserInfo }>('company')
      .populate<{ locations: env.LocationInfo[] }>({
        path: 'locations',
        populate: {
          path: 'values',
          model: 'LocationValue',
        },
      })
      .lean()

    if (car) {
      if (car.company) {
        const {
          _id,
          fullName,
          avatar,
          payLater,
        } = car.company
        car.company = {
          _id,
          fullName,
          avatar,
          payLater,
        }
      }

      for (const location of car.locations) {
        location.name = location.values.filter((value) => value.language === language)[0].value
      }

      return res.json(car)
    }
    console.error('[car.getCar] Car not found:', id)
    return res.sendStatus(204)
  } catch (err) {
    console.error(`[car.getCar] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

/**
 * Get Cars.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function getCars(req: Request, res: Response) {
  try {
    const { body }: { body: bookcarsTypes.GetCarsPayload } = req
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)
    const companies = body.companies.map((id) => new mongoose.Types.ObjectId(id))
    const {
      fuel,
      gearbox,
      mileage,
      deposit,
      availability,
    } = body
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'

    const $match: mongoose.FilterQuery<any> = {
      $and: [{ name: { $regex: keyword, $options: options } }, { company: { $in: companies } }],
    }

    if ($match.$and) {
      if (fuel) {
        $match.$and.push({ type: { $in: fuel } })
      }

      if (gearbox) {
        $match.$and.push({ gearbox: { $in: gearbox } })
      }

      if (mileage) {
        if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Limited) {
          $match.$and.push({ mileage: { $gt: -1 } })
        } else if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Unlimited) {
          $match.$and.push({ mileage: -1 })
        } else if (mileage.length === 0) {
          return res.json([{ resultData: [], pageInfo: [] }])
        }
      }

      if (deposit && deposit > -1) {
        $match.$and.push({ deposit: { $lte: deposit } })
      }

      if (availability) {
        if (availability.length === 1 && availability[0] === bookcarsTypes.Availablity.Available) {
          $match.$and.push({ available: true })
        } else if (availability.length === 1
          && availability[0] === bookcarsTypes.Availablity.Unavailable) {
          $match.$and.push({ available: false })
        } else if (availability.length === 0) {
          return res.json([{ resultData: [], pageInfo: [] }])
        }
      }
    }

    const data = await Car.aggregate(
      [
        { $match },
        {
          $lookup: {
            from: 'User',
            let: { userId: '$company' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$userId'] },
                },
              },
            ],
            as: 'company',
          },
        },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: 'Location',
            let: { locations: '$locations' },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$_id', '$$locations'] },
                },
              },
            ],
            as: 'locations',
          },
        },
        {
          $facet: {
            resultData: [{ $sort: { name: 1 } }, { $skip: (page - 1) * size }, { $limit: size }],
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
      for (const car of data[0].resultData) {
        if (car.company) {
          const { _id, fullName, avatar } = car.company
          car.company = { _id, fullName, avatar }
        }
      }
    }

    return res.json(data)
  } catch (err) {
    console.error(`[car.getCars] ${strings.DB_ERROR} ${req.query.s}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

/**
 * Get Cars by Supplier and pick-up Location.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function getBookingCars(req: Request, res: Response) {
  try {
    const { body }: { body: bookcarsTypes.GetBookingCarsPayload } = req
    const company = new mongoose.Types.ObjectId(body.company)
    const pickupLocation = new mongoose.Types.ObjectId(body.pickupLocation)
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)

    const cars = await Car.aggregate(
      [
        {
          $match: {
            $and: [
              { company: { $eq: company } },
              { locations: pickupLocation },
              { available: true }, { name: { $regex: keyword, $options: options } },
            ],
          },
        },
        { $sort: { name: 1 } },
        { $skip: (page - 1) * size },
        { $limit: size },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    return res.json(cars)
  } catch (err) {
    console.error(`[car.getBookingCars] ${strings.DB_ERROR} ${req.query.s}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

/**
 * Get Cars available for rental.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export async function getFrontendCars(req: Request, res: Response) {
  try {
    const { body }: { body: bookcarsTypes.GetCarsPayload } = req
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)
    const companies = body.companies.map((id) => new mongoose.Types.ObjectId(id))
    const pickupLocation = new mongoose.Types.ObjectId(body.pickupLocation)
    const {
      fuel,
      gearbox,
      mileage,
      deposit,
    } = body

    const $match: mongoose.FilterQuery<any> = {
      $and: [
        { company: { $in: companies } },
        { locations: pickupLocation },
        { available: true }, { type: { $in: fuel } },
        { gearbox: { $in: gearbox } },
      ],
    }

    if ($match.$and) {
      if (mileage) {
        if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Limited) {
          $match.$and.push({ mileage: { $gt: -1 } })
        } else if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Unlimited) {
          $match.$and.push({ mileage: -1 })
        } else if (mileage.length === 0) {
          return res.json([{ resultData: [], pageInfo: [] }])
        }
      }

      if (deposit && deposit > -1) {
        $match.$and.push({ deposit: { $lte: deposit } })
      }
    }

    const data = await Car.aggregate(
      [
        { $match },
        {
          $lookup: {
            from: 'User',
            let: { userId: '$company' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$userId'] },
                },
              },
            ],
            as: 'company',
          },
        },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: 'Location',
            let: { locations: '$locations' },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$_id', '$$locations'] },
                },
              },
            ],
            as: 'locations',
          },
        },
        {
          $facet: {
            resultData: [{ $sort: { name: 1 } }, { $skip: (page - 1) * size }, { $limit: size }],
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
      for (const car of data[0].resultData) {
        if (car.company) {
          const { _id, fullName, avatar } = car.company
          car.company = { _id, fullName, avatar }
        }
      }
    }

    return res.json(data)
  } catch (err) {
    console.error(`[car.getFrontendCars] ${strings.DB_ERROR} ${req.query.s}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}
