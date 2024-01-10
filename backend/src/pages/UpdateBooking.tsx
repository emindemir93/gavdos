import React, { useState, useCallback } from 'react'
import {
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  InputLabel,
  Input
} from '@mui/material'
import {
  Info as InfoIcon,
  Person as DriverIcon
} from '@mui/icons-material'
import validator from 'validator'
import { intervalToDuration } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import * as bookcarsTypes from 'bookcars-types'
import * as bookcarsHelper from 'bookcars-helper'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as blStrings } from '../lang/booking-list'
import { strings as bfStrings } from '../lang/booking-filter'
import { strings as csStrings } from '../lang/cars'
import { strings } from '../lang/booking'
import * as Helper from '../common/Helper'
import Master from '../components/Master'
import * as UserService from '../services/UserService'
import * as BookingService from '../services/BookingService'
import * as CarService from '../services/CarService'
import Backdrop from '../components/SimpleBackdrop'
import NoMatch from './NoMatch'
import Error from './Error'
import CarList from '../components/CarList'
import SupplierSelectList from '../components/SupplierSelectList'
import UserSelectList from '../components/UserSelectList'
import LocationSelectList from '../components/LocationSelectList'
import CarSelectList from '../components/CarSelectList'
import StatusList from '../components/StatusList'
import DateTimePicker from '../components/DateTimePicker'
import DatePicker from '../components/DatePicker'

import '../assets/css/booking.css'

function UpdateBooking() {
  const navigate = useNavigate()
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [loading, setLoading] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [error, setError] = useState(false)
  const [booking, setBooking] = useState<bookcarsTypes.Booking>()
  const [visible, setVisible] = useState(false)
  const [isCompany, setIsCompany] = useState(false)
  const [company, setCompany] = useState<bookcarsTypes.Option>()
  const [car, setCar] = useState<bookcarsTypes.Car>()
  const [price, setPrice] = useState<number>()
  const [driver, setDriver] = useState<bookcarsTypes.Option>()
  const [pickupLocation, setPickupLocation] = useState<bookcarsTypes.Option>()
  const [dropOffLocation, setDropOffLocation] = useState<bookcarsTypes.Option>()
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [status, setStatus] = useState<bookcarsTypes.BookingStatus>()
  const [cancellation, setCancellation] = useState(false)
  const [amendments, setAmendments] = useState(false)
  const [theftProtection, setTheftProtection] = useState(false)
  const [collisionDamageWaiver, setCollisionDamageWaiver] = useState(false)
  const [fullInsurance, setFullInsurance] = useState(false)
  const [additionalDriver, setAdditionalDriver] = useState(false)
  const [minDate, setMinDate] = useState<Date>()
  const [additionalDriverfullName, setAdditionalDriverFullName] = useState('')
  const [addtionalDriverEmail, setAdditionalDriverEmail] = useState('')
  const [additionalDriverPhone, setAdditionalDriverPhone] = useState('')
  const [addtionalDriverBirthDate, setAdditionalDriverBirthDate] = useState<Date>()
  const [additionalDriverEmailValid, setAdditionalDriverEmailValid] = useState(true)
  const [additionalDriverPhoneValid, setAdditionalDriverPhoneValid] = useState(true)
  const [additionalDriverBirthDateValid, setAdditionalDriverBirthDateValid] = useState(true)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  const handleCompanyChange = (values: bookcarsTypes.Option[]) => {
    setCompany(values.length > 0 ? values[0] : undefined)
  }

  const handleDriverChange = (values: bookcarsTypes.Option[]) => {
    setDriver(values.length > 0 ? values[0] : undefined)
  }

  const handlePickupLocationChange = (values: bookcarsTypes.Option[]) => {
    setPickupLocation(values.length > 0 ? values[0] : undefined)
  }

  const handleDropOffLocationChange = (values: bookcarsTypes.Option[]) => {
    setDropOffLocation(values.length > 0 ? values[0] : undefined)
  }

  const handleCarSelectListChange = useCallback(
    async (values: bookcarsTypes.Car[]) => {
      try {
        const newCar = values.length > 0 ? values[0] : undefined

        if ((!car && newCar) || (car && newCar && car._id !== newCar._id)) {
          // car changed
          const _car = await CarService.getCar(newCar._id)

          if (_car) {
            const _booking = bookcarsHelper.clone(booking)
            _booking.car = _car
            Helper.price(
              _booking,
              _car,
              (_price) => {
                setPrice(_price)
              },
              (err) => {
                Helper.error(err)
              },
            )

            setBooking(_booking)
            setCar(newCar)
          } else {
            Helper.error()
          }
        } else if (!newCar) {
          setPrice(0)
          setCar(newCar)
        } else {
          setCar(newCar)
        }
      } catch (err) {
        Helper.error(err)
      }
    },
    [car, booking],
  )

  const handleStatusChange = (value: bookcarsTypes.BookingStatus) => {
    setStatus(value)
  }

  const handleCancellationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (booking) {
      booking.cancellation = e.target.checked

      Helper.price(
        booking,
        booking.car as bookcarsTypes.Car,
        (_price) => {
          setBooking(booking)
          setPrice(_price)
          setCancellation(booking.cancellation || false)
        },
        (err) => {
          Helper.error(err)
        },
      )
    }
  }

  const handleAmendmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (booking) {
      booking.amendments = e.target.checked

      Helper.price(
        booking,
        booking.car as bookcarsTypes.Car,
        (_price) => {
          setBooking(booking)
          setPrice(_price)
          setAmendments(booking.amendments || false)
        },
        (err) => {
          Helper.error(err)
        },
      )
    }
  }

  const handleCollisionDamageWaiverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (booking) {
      booking.collisionDamageWaiver = e.target.checked

      Helper.price(
        booking,
        booking.car as bookcarsTypes.Car,
        (_price) => {
          setBooking(booking)
          setPrice(_price)
          setCollisionDamageWaiver(booking.collisionDamageWaiver || false)
        },
        (err) => {
          Helper.error(err)
        },
      )
    }
  }

  const handleTheftProtectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (booking) {
      booking.theftProtection = e.target.checked

      Helper.price(
        booking,
        booking.car as bookcarsTypes.Car,
        (_price) => {
          setBooking(booking)
          setPrice(_price)
          setTheftProtection(booking.theftProtection || false)
        },
        (err) => {
          Helper.error(err)
        },
      )
    }
  }

  const handleFullInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (booking) {
      booking.fullInsurance = e.target.checked

      Helper.price(
        booking,
        booking.car as bookcarsTypes.Car,
        (_price) => {
          setBooking(booking)
          setPrice(_price)
          setFullInsurance(booking.fullInsurance || false)
        },
        (err) => {
          Helper.error(err)
        },
      )
    }
  }

  const handleAdditionalDriverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (booking) {
      booking.additionalDriver = e.target.checked

      Helper.price(
        booking,
        booking.car as bookcarsTypes.Car,
        (_price) => {
          setBooking(booking)
          setPrice(_price)
          setAdditionalDriver(booking.additionalDriver || false)
        },
        (err) => {
          Helper.error(err)
        },
      )
    }
  }

  const toastErr = (err?: unknown, hideLoading?: boolean): void => {
    Helper.error(err)
    if (hideLoading) {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    setOpenDeleteDialog(true)
  }

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false)
  }

  const handleConfirmDelete = async () => {
    if (booking && booking._id) {
      try {
        setOpenDeleteDialog(false)

        const _status = await BookingService.deleteBookings([booking._id])

        if (_status === 200) {
          navigate('/')
        } else {
          toastErr(true)
        }
      } catch (err) {
        Helper.error(err)
      }
    } else {
      Helper.error()
    }
  }

  const _validateEmail = (email: string) => {
    if (email) {
      if (validator.isEmail(email)) {
        setAdditionalDriverEmailValid(true)
        return true
      }
      setAdditionalDriverEmailValid(false)
      return false
    }
    setAdditionalDriverEmailValid(true)
    return false
  }

  const _validatePhone = (phone?: string) => {
    if (phone) {
      const _phoneValid = validator.isMobilePhone(phone)
      setAdditionalDriverPhoneValid(_phoneValid)

      return _phoneValid
    }
    setAdditionalDriverPhoneValid(true)

    return true
  }

  const _validateBirthDate = (date?: Date) => {
    if (date) {
      const now = new Date()
      const sub = intervalToDuration({ start: date, end: now }).years ?? 0
      const _birthDateValid = sub >= Env.MINIMUM_AGE

      setAdditionalDriverBirthDateValid(_birthDateValid)
      return _birthDateValid
    }
    setAdditionalDriverBirthDateValid(true)
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const additionalDriverSet = Helper.carOptionAvailable(car, 'additionalDriver') && additionalDriver

      if (additionalDriverSet) {
        const emailValid = _validateEmail(addtionalDriverEmail)
        if (!emailValid) {
          return
        }

        const phoneValid = _validatePhone(additionalDriverPhone)
        if (!phoneValid) {
          return
        }

        const birthDateValid = _validateBirthDate(addtionalDriverBirthDate)
        if (!birthDateValid) {
          return
        }
      }

      if (!booking || !company || !car || !driver || !pickupLocation || !dropOffLocation || !from || !to || !status) {
        Helper.error()
        return
      }

      const _booking: bookcarsTypes.Booking = {
        _id: booking._id,
        company: company._id,
        car: car._id,
        driver: driver._id,
        pickupLocation: pickupLocation._id,
        dropOffLocation: dropOffLocation._id,
        from,
        to,
        status,
        cancellation,
        amendments,
        theftProtection,
        collisionDamageWaiver,
        fullInsurance,
        additionalDriver: additionalDriverSet,
        price,
      }

      let payload: bookcarsTypes.UpsertBookingPayload
      let _additionalDriver: bookcarsTypes.AdditionalDriver
      if (additionalDriverSet) {
        if (!addtionalDriverBirthDate) {
          Helper.error()
          return
        }
        _additionalDriver = {
          fullName: additionalDriverfullName,
          email: addtionalDriverEmail,
          phone: additionalDriverPhone,
          birthDate: addtionalDriverBirthDate,
        }

        payload = {
          booking: _booking,
          additionalDriver: _additionalDriver,
        }
      } else {
        payload = { booking: _booking }
      }

      const _status = await BookingService.update(payload)

      if (_status === 200) {
        if (!additionalDriverSet) {
          setAdditionalDriverFullName('')
          setAdditionalDriverEmail('')
          setAdditionalDriverPhone('')
          setAdditionalDriverBirthDate(undefined)
        }
        Helper.info(commonStrings.UPDATED)
      } else {
        toastErr()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    if (_user) {
      setUser(_user)
      setLoading(true)

      const params = new URLSearchParams(window.location.search)
      if (params.has('b')) {
        const id = params.get('b')
        if (id && id !== '') {
          try {
            const _booking = await BookingService.getBooking(id)

            if (_booking) {
              if (!Helper.admin(_user) && (_booking.company as bookcarsTypes.User)._id !== _user._id) {
                setLoading(false)
                setNoMatch(true)
                return
              }

              setBooking(_booking)
              setPrice(_booking.price)
              setLoading(false)
              setVisible(true)
              setIsCompany(_user.type === bookcarsTypes.RecordType.Company)
              const cmp = _booking.company as bookcarsTypes.User
              setCompany({
                _id: cmp._id as string,
                name: cmp.fullName,
                image: cmp.avatar,
              })
              setCar(_booking.car as bookcarsTypes.Car)
              const drv = _booking.driver as bookcarsTypes.User
              setDriver({
                _id: drv._id as string,
                name: drv.fullName,
                image: drv.avatar,
              })
              const pul = _booking.pickupLocation as bookcarsTypes.Location
              setPickupLocation({
                _id: pul._id,
                name: pul.name || '',
              })
              const dol = _booking.dropOffLocation as bookcarsTypes.Location
              setDropOffLocation({
                _id: dol._id,
                name: dol.name || '',
              })
              setFrom(new Date(_booking.from))
              setMinDate(new Date(_booking.from))
              setTo(new Date(_booking.to))
              setStatus(_booking.status)
              setCancellation(_booking.cancellation || false)
              setAmendments(_booking.amendments || false)
              setTheftProtection(_booking.theftProtection || false)
              setCollisionDamageWaiver(_booking.collisionDamageWaiver || false)
              setFullInsurance(_booking.fullInsurance || false)
              setAdditionalDriver((_booking.additionalDriver && !!_booking._additionalDriver) || false)
              if (_booking.additionalDriver && _booking._additionalDriver) {
                const _additionalDriver = _booking._additionalDriver as bookcarsTypes.AdditionalDriver
                setAdditionalDriverFullName(_additionalDriver.fullName)
                setAdditionalDriverEmail(_additionalDriver.email)
                setAdditionalDriverPhone(_additionalDriver.phone)
                setAdditionalDriverBirthDate(new Date(_additionalDriver.birthDate))
              }
            } else {
              setLoading(false)
              setNoMatch(true)
            }
          } catch (err) {
            setLoading(false)
            setError(true)
            setVisible(false)
          }
        } else {
          setLoading(false)
          setNoMatch(true)
        }
      } else {
        setLoading(false)
        setNoMatch(true)
      }
    }
  }

  const days = bookcarsHelper.days(from, to)

  return (
    <Master onLoad={onLoad} strict>
      {visible && booking && (
        <div className="booking">
          <div className="col-1">
            <form onSubmit={handleSubmit}>
              {!isCompany && (
                <FormControl fullWidth margin="dense">
                  <SupplierSelectList
                    label={blStrings.COMPANY}
                    required
                    variant="standard"
                    onChange={handleCompanyChange}
                    value={company}
                  />
                </FormControl>
              )}

              <UserSelectList
                label={blStrings.DRIVER}
                required
                variant="standard"
                onChange={handleDriverChange}
                value={driver}
              />

              <FormControl fullWidth margin="dense">
                <LocationSelectList
                  label={bfStrings.PICKUP_LOCATION}
                  required
                  variant="standard"
                  onChange={handlePickupLocationChange}
                  value={pickupLocation}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <LocationSelectList
                  label={bfStrings.DROP_OFF_LOCATION}
                  required
                  variant="standard"
                  onChange={handleDropOffLocationChange}
                  value={dropOffLocation}
                />
              </FormControl>

              <CarSelectList
                label={blStrings.CAR}
                company={(company && company._id) || ''}
                pickupLocation={(pickupLocation && pickupLocation._id) || ''}
                onChange={handleCarSelectListChange}
                required
                value={car}
              />

              <FormControl fullWidth margin="dense">
                <DateTimePicker
                  label={commonStrings.FROM}
                  value={from}
                  required
                  onChange={(date) => {
                    if (date) {
                      booking.from = date

                      Helper.price(
                        booking,
                        booking.car as bookcarsTypes.Car,
                        (_price) => {
                          setBooking(booking)
                          setPrice(_price)
                          setFrom(date)

                          const _minDate = new Date(date)
                          _minDate.setDate(_minDate.getDate() + 1)
                          setMinDate(_minDate)

                          if (to && to.getTime() <= date.getTime()) {
                            setTo(undefined)
                          }
                        },
                        (err) => {
                          toastErr(err)
                        },
                      )
                    } else {
                      setMinDate(undefined)
                      setFrom(undefined)
                    }
                  }}
                  language={UserService.getLanguage()}
                />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <DateTimePicker
                  label={commonStrings.TO}
                  value={to}
                  minDate={minDate}
                  required
                  onChange={(date) => {
                    if (date) {
                      booking.to = date

                      Helper.price(
                        booking,
                        booking.car as bookcarsTypes.Car,
                        (_price) => {
                          setBooking(booking)
                          setPrice(_price)
                          setTo(date)
                        },
                        (err) => {
                          toastErr(err)
                        },
                      )
                    }
                  }}
                  language={UserService.getLanguage()}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <StatusList label={blStrings.STATUS} onChange={handleStatusChange} required value={status} />
              </FormControl>

              <div className="info">
                <InfoIcon />
                <span>{commonStrings.OPTIONAL}</span>
              </div>

              <FormControl fullWidth margin="dense" className="checkbox-fc">
                <FormControlLabel
                  control={<Switch checked={cancellation} onChange={handleCancellationChange} color="primary" />}
                  label={csStrings.CANCELLATION}
                  className="checkbox-fcl"
                  disabled={!Helper.carOptionAvailable(car, 'cancellation')}
                />
              </FormControl>

              <FormControl fullWidth margin="dense" className="checkbox-fc">
                <FormControlLabel
                  control={<Switch checked={amendments} onChange={handleAmendmentsChange} color="primary" />}
                  label={csStrings.AMENDMENTS}
                  className="checkbox-fcl"
                  disabled={!Helper.carOptionAvailable(car, 'amendments')}
                />
              </FormControl>

              <FormControl fullWidth margin="dense" className="checkbox-fc">
                <FormControlLabel
                  control={<Switch checked={theftProtection} onChange={handleTheftProtectionChange} color="primary" />}
                  label={csStrings.THEFT_PROTECTION}
                  className="checkbox-fcl"
                  disabled={!Helper.carOptionAvailable(car, 'theftProtection')}
                />
              </FormControl>

              <FormControl fullWidth margin="dense" className="checkbox-fc">
                <FormControlLabel
                  control={<Switch checked={collisionDamageWaiver} onChange={handleCollisionDamageWaiverChange} color="primary" />}
                  label={csStrings.COLLISION_DAMAGE_WAVER}
                  className="checkbox-fcl"
                  disabled={!Helper.carOptionAvailable(car, 'collisionDamageWaiver')}
                />
              </FormControl>

              <FormControl fullWidth margin="dense" className="checkbox-fc">
                <FormControlLabel
                  control={<Switch checked={fullInsurance} onChange={handleFullInsuranceChange} color="primary" />}
                  label={csStrings.FULL_INSURANCE}
                  className="checkbox-fcl"
                  disabled={!Helper.carOptionAvailable(car, 'fullInsurance')}
                />
              </FormControl>

              <FormControl fullWidth margin="dense" className="checkbox-fc">
                <FormControlLabel
                  control={<Switch checked={additionalDriver} onChange={handleAdditionalDriverChange} color="primary" />}
                  label={csStrings.ADDITIONAL_DRIVER}
                  className="checkbox-fcl"
                  disabled={!Helper.carOptionAvailable(car, 'additionalDriver')}
                />
              </FormControl>

              {Helper.carOptionAvailable(car, 'additionalDriver') && additionalDriver && (
                <>
                  <div className="info">
                    <DriverIcon />
                    <span>{csStrings.ADDITIONAL_DRIVER}</span>
                  </div>
                  <FormControl fullWidth margin="dense">
                    <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                    <Input
                      type="text"
                      value={additionalDriverfullName}
                      required
                      onChange={(e) => {
                        setAdditionalDriverFullName(e.target.value)
                      }}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                    <Input
                      type="text"
                      value={addtionalDriverEmail}
                      error={!additionalDriverEmailValid}
                      onBlur={(e) => {
                        _validateEmail(e.target.value)
                      }}
                      onChange={(e) => {
                        setAdditionalDriverEmail(e.target.value)

                        if (!e.target.value) {
                          setAdditionalDriverEmailValid(true)
                        }
                      }}
                      required
                      autoComplete="off"
                    />
                    <FormHelperText error={!additionalDriverEmailValid}>{(!additionalDriverEmailValid && commonStrings.EMAIL_NOT_VALID) || ''}</FormHelperText>
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <InputLabel className="required">{commonStrings.PHONE}</InputLabel>
                    <Input
                      type="text"
                      value={additionalDriverPhone}
                      error={!additionalDriverPhoneValid}
                      onBlur={(e) => {
                        _validatePhone(e.target.value)
                      }}
                      onChange={(e) => {
                        setAdditionalDriverPhone(e.target.value)

                        if (!e.target.value) {
                          setAdditionalDriverPhoneValid(true)
                        }
                      }}
                      required
                      autoComplete="off"
                    />
                    <FormHelperText error={!additionalDriverPhoneValid}>{(!additionalDriverPhoneValid && commonStrings.PHONE_NOT_VALID) || ''}</FormHelperText>
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <DatePicker
                      label={commonStrings.BIRTH_DATE}
                      value={addtionalDriverBirthDate}
                      required
                      onChange={(_birthDate) => {
                        if (_birthDate) {
                          const _birthDateValid = _validateBirthDate(_birthDate)
                          setAdditionalDriverBirthDate(_birthDate)
                          setAdditionalDriverBirthDateValid(_birthDateValid)
                        }
                      }}
                      language={UserService.getLanguage()}
                    />
                    <FormHelperText error={!additionalDriverBirthDateValid}>{(!additionalDriverBirthDateValid && Helper.getBirthDateError(Env.MINIMUM_AGE)) || ''}</FormHelperText>
                  </FormControl>
                </>
              )}

              <div>
                <div className="buttons">
                  <Button variant="contained" className="btn-primary btn-margin-bottom" size="small" type="submit">
                    {commonStrings.SAVE}
                  </Button>
                  <Button variant="contained" className="btn-margin-bottom" color="error" size="small" onClick={handleDelete}>
                    {commonStrings.DELETE}
                  </Button>
                  <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" href="/">
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </div>
            </form>
          </div>
          <div className="col-2">
            <div className="col-2-header">
              <div className="price">
                <span className="price-days">{Helper.getDays(days)}</span>
                <span className="price-main">{`${bookcarsHelper.formatNumber(price ?? 0)} ${commonStrings.CURRENCY}`}</span>
                <span className="price-day">{`${csStrings.PRICE_PER_DAY} ${Math.floor((price ?? 0) / days)} ${commonStrings.CURRENCY}`}</span>
              </div>
            </div>
            <CarList
              className="car"
              user={user}
              booking={booking}
              cars={((car && [booking.car]) as bookcarsTypes.Car[]) || []}
              hidePrice
            />
          </div>

          <Dialog disableEscapeKeyDown maxWidth="xs" open={openDeleteDialog}>
            <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
            <DialogContent>{strings.DELETE_BOOKING}</DialogContent>
            <DialogActions className="dialog-actions">
              <Button onClick={handleCancelDelete} variant="contained" className="btn-secondary">
                {commonStrings.CANCEL}
              </Button>
              <Button onClick={handleConfirmDelete} variant="contained" color="error">
                {commonStrings.DELETE}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}

      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      {noMatch && <NoMatch hideHeader />}
      {error && <Error />}
    </Master>
  )
}

export default UpdateBooking
