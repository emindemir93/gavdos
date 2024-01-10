import React, { useState, useCallback } from 'react'
import {
  FormControl,
  Button,
  Paper,
  FormControlLabel,
  Switch,
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
import Master from '../components/Master'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as blStrings } from '../lang/booking-list'
import { strings as bfStrings } from '../lang/booking-filter'
import { strings as csStrings } from '../lang/cars'
import { strings } from '../lang/create-booking'
import * as UserService from '../services/UserService'
import * as BookingService from '../services/BookingService'
import * as Helper from '../common/Helper'
import SupplierSelectList from '../components/SupplierSelectList'
import UserSelectList from '../components/UserSelectList'
import LocationSelectList from '../components/LocationSelectList'
import CarSelectList from '../components/CarSelectList'
import StatusList from '../components/StatusList'
import DateTimePicker from '../components/DateTimePicker'
import DatePicker from '../components/DatePicker'

import '../assets/css/create-booking.css'

function CreateBooking() {
  const navigate = useNavigate()
  const [isCompany, setIsCompany] = useState(false)
  const [visible, setVisible] = useState(false)
  const [company, setCompany] = useState('')
  const [car, setCar] = useState<bookcarsTypes.Car>()
  const [driver, setDriver] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropOffLocation, setDropOffLocation] = useState('')
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

  const handleCompanyChange = (values: bookcarsTypes.Option[]) => {
    setCompany(values.length > 0 ? values[0]._id : '')
  }

  const handleDriverChange = (values: bookcarsTypes.Option[]) => {
    setDriver(values.length > 0 ? values[0]._id : '')
  }

  const handlePickupLocationChange = (values: bookcarsTypes.Option[]) => {
    setPickupLocation(values.length > 0 ? values[0]._id : '-1')
  }

  const handleDropOffLocationChange = (values: bookcarsTypes.Option[]) => {
    setDropOffLocation(values.length > 0 ? values[0]._id : '-1')
  }

  const handleCarSelectListChange = useCallback((values: bookcarsTypes.Car[]) => {
    if (Array.isArray(values) && values.length > 0) {
      const _car = values[0]
      if (_car) {
        setCar(_car)
      } else {
        Helper.error()
      }
    }
  }, [])

  const handleStatusChange = (value: bookcarsTypes.BookingStatus) => {
    setStatus(value)
  }

  const handleCancellationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCancellation(e.target.checked)
  }

  const handleAmendmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmendments(e.target.checked)
  }

  const handleTheftProtectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheftProtection(e.target.checked)
  }

  const handleCollisionDamageWaiverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollisionDamageWaiver(e.target.checked)
  }

  const handleFullInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullInsurance(e.target.checked)
  }

  const handleAdditionalDriverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdditionalDriver(e.target.checked)
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
    if (date && bookcarsHelper.isDate(date)) {
      const now = new Date()
      const sub = intervalToDuration({ start: date, end: now }).years ?? 0
      const _birthDateValid = sub >= Env.MINIMUM_AGE

      setAdditionalDriverBirthDateValid(_birthDateValid)
      return _birthDateValid
    }
    setAdditionalDriverBirthDateValid(true)
    return true
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!car || !from || !to || !status) {
      Helper.error()
      return
    }

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

    const booking: bookcarsTypes.Booking = {
      company,
      car: car._id,
      driver,
      pickupLocation,
      dropOffLocation,
      from,
      to,
      status,
      cancellation,
      amendments,
      theftProtection,
      collisionDamageWaiver,
      fullInsurance,
      additionalDriver: additionalDriverSet,
    }

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
    }

    Helper.price(
      booking,
      null,
      async (price) => {
        try {
          booking.price = price

          const _booking = await BookingService.create({
            booking,
            additionalDriver: _additionalDriver,
          })
          if (_booking && _booking._id) {
            navigate('/')
          } else {
            Helper.error()
          }
        } catch (err) {
          Helper.error(err)
        }
      },
      (err) => {
        Helper.error(err)
      },
    )
  }

  const onLoad = (user?: bookcarsTypes.User) => {
    if (user) {
      setVisible(true)

      if (user.type === bookcarsTypes.RecordType.Company) {
        setCompany(user._id as string)
        setIsCompany(true)
      }
    }
  }

  return (
    <Master onLoad={onLoad} strict>
      <div className="create-booking">
        <Paper className="booking-form booking-form-wrapper" elevation={10} style={visible ? {} : { display: 'none' }}>
          <h1 className="booking-form-title">
            {' '}
            {strings.NEW_BOOKING_HEADING}
            {' '}
          </h1>
          <form onSubmit={handleSubmit}>
            {!isCompany && (
              <FormControl fullWidth margin="dense">
                <SupplierSelectList
                  label={blStrings.COMPANY}
                  required
                  variant="standard"
                  onChange={handleCompanyChange}
                />
              </FormControl>
            )}

            <UserSelectList
              label={blStrings.DRIVER}
              required
              variant="standard"
              onChange={handleDriverChange}
            />

            <FormControl fullWidth margin="dense">
              <LocationSelectList
                label={bfStrings.PICKUP_LOCATION}
                required
                variant="standard"
                onChange={handlePickupLocationChange}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <LocationSelectList
                label={bfStrings.DROP_OFF_LOCATION}
                required
                variant="standard"
                onChange={handleDropOffLocationChange}
              />
            </FormControl>

            <CarSelectList
              label={blStrings.CAR}
              company={company}
              pickupLocation={pickupLocation}
              onChange={handleCarSelectListChange}
              required
            />

            <FormControl fullWidth margin="dense">
              <DateTimePicker
                label={commonStrings.FROM}
                value={from}
                required
                onChange={(date) => {
                  if (date) {
                    if (to && to.getTime() <= date.getTime()) {
                      setTo(undefined)
                    }

                    const _minDate = new Date(date)
                    _minDate.setDate(_minDate.getDate() + 1)
                    setMinDate(_minDate)
                  } else {
                    setMinDate(undefined)
                  }

                  setFrom(date || undefined)
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
                  setTo(date || undefined)
                }}
                language={UserService.getLanguage()}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <StatusList
                label={blStrings.STATUS}
                onChange={handleStatusChange}
                required
              />
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
                  <FormHelperText
                    error={!additionalDriverPhoneValid}
                  >
                    {(!additionalDriverPhoneValid && commonStrings.PHONE_NOT_VALID) || ''}
                  </FormHelperText>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <DatePicker
                    label={commonStrings.BIRTH_DATE}
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
                  <FormHelperText
                    error={!additionalDriverBirthDateValid}
                  >
                    {(!additionalDriverBirthDateValid && Helper.getBirthDateError(Env.MINIMUM_AGE)) || ''}
                  </FormHelperText>
                </FormControl>
              </>
            )}

            <div>
              <div className="buttons">
                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.CREATE}
                </Button>
                <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" href="/">
                  {commonStrings.CANCEL}
                </Button>
              </div>
            </div>
          </form>
        </Paper>
      </div>
    </Master>
  )
}

export default CreateBooking
