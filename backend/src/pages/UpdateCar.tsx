import React, { useState } from 'react'
import {
  Input,
  InputLabel,
  FormControl,
  Button,
  Paper,
  FormControlLabel,
  Switch,
  TextField,
  FormHelperText
} from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import * as bookcarsTypes from 'bookcars-types'
import Master from '../components/Master'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as csStrings } from '../lang/cars'
import { strings } from '../lang/create-car'
import * as CarService from '../services/CarService'
import * as Helper from '../common/Helper'
import Error from './Error'
import ErrorMessage from '../components/Error'
import Backdrop from '../components/SimpleBackdrop'
import NoMatch from './NoMatch'
import Avatar from '../components/Avatar'
import SupplierSelectList from '../components/SupplierSelectList'
import LocationSelectList from '../components/LocationSelectList'
import CarTypeList from '../components/CarTypeList'
import GearboxList from '../components/GearboxList'
import SeatsList from '../components/SeatsList'
import DoorsList from '../components/DoorsList'
import FuelPolicyList from '../components/FuelPolicyList'

import '../assets/css/create-car.css'
import '../assets/css/update-car.css'

function UpdateCar() {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [car, setCar] = useState<bookcarsTypes.Car>()
  const [noMatch, setNoMatch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState(false)
  const [imageRequired, setImageRequired] = useState(false)
  const [imageSizeError, setImageSizeError] = useState(false)
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState<bookcarsTypes.Option>()
  const [locations, setLocations] = useState<bookcarsTypes.Option[]>([])
  const [available, setAvailable] = useState(false)
  const [type, setType] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [price, setPrice] = useState('')
  const [seats, setSeats] = useState('')
  const [doors, setDoors] = useState('')
  const [aircon, setAircon] = useState(false)
  const [mileage, setMileage] = useState('')
  const [fuelPolicy, setFuelPolicy] = useState('')
  const [cancellation, setCancellation] = useState('')
  const [amendments, setAmendments] = useState('')
  const [theftProtection, setTheftProtection] = useState('')
  const [collisionDamageWaiver, setCollisionDamageWaiver] = useState('')
  const [fullInsurance, setFullInsurance] = useState('')
  const [additionalDriver, setAdditionalDriver] = useState('')
  const [minimumAge, setMinimumAge] = useState(String(Env.MINIMUM_AGE))
  const [minimumAgeValid, setMinimumAgeValid] = useState(true)
  const [formError, setFormError] = useState(false)
  const [deposit, setDeposit] = useState('')

  const handleBeforeUpload = () => {
    setLoading(true)
  }

  const handleImageChange = (_image: string) => {
    setLoading(false)
    setImage(_image as string)

    if (_image !== null) {
      setImageRequired(false)
    }
  }

  const handleImageValidate = (valid: boolean) => {
    if (!valid) {
      setImageSizeError(true)
      setImageRequired(false)
      setError(false)
      setLoading(false)
    } else {
      setImageSizeError(false)
      setImageRequired(false)
      setError(false)
    }
  }
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleCompanyChange = (values: bookcarsTypes.Option[]) => {
    setCompany(values.length > 0 ? values[0] : undefined)
  }

  const validateMinimumAge = (age: string, updateState = true) => {
    if (age) {
      const _age = Number.parseInt(age, 10)
      const _minimumAgeValid = _age >= Env.MINIMUM_AGE && _age <= 99
      if (updateState) {
        setMinimumAgeValid(_minimumAgeValid)
      }
      if (_minimumAgeValid) {
        setFormError(false)
      }
      return _minimumAgeValid
    }
    setMinimumAgeValid(true)
    setFormError(false)
    return true
  }

  const handleMinimumAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinimumAge(e.target.value)

    const _minimumAgeValid = validateMinimumAge(e.target.value, false)
    if (_minimumAgeValid) {
      setMinimumAgeValid(true)
      setFormError(false)
    }
  }

  const handleLocationsChange = (_locations: bookcarsTypes.Option[]) => {
    setLocations(_locations)
  }

  const handleAvailableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailable(e.target.checked)
  }

  const handleCarTypeChange = (value: string) => {
    setType(value)
  }

  const handleGearboxChange = (value: string) => {
    setGearbox(value)
  }

  const handleAirconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAircon(e.target.checked)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value)
  }

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeposit(e.target.value)
  }

  const handleSeatsChange = (value: string) => {
    setSeats(value)
  }

  const handleDoorsChange = (value: string) => {
    setDoors(value)
  }

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMileage(e.target.value)
  }

  const handleFuelPolicyChange = (value: string) => {
    setFuelPolicy(value)
  }

  const handleCancellationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCancellation(e.target.value)
  }

  const handleAmendmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmendments(e.target.value)
  }

  const handleTheftProtectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheftProtection(e.target.value)
  }

  const handleCollisionDamageWaiverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollisionDamageWaiver(e.target.value)
  }

  const handleFullinsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullInsurance(e.target.value)
  }

  const handleAdditionalDriverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdditionalDriver(e.target.value)
  }

  const extraToString = (extra: number) => (extra === -1 ? '' : String(extra))

  const extraToNumber = (extra: string) => (extra === '' ? -1 : Number(extra))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const _minimumAgeValid = validateMinimumAge(minimumAge)
      if (!_minimumAgeValid) {
        setFormError(true)
        return
      }

      if (!car || !company) {
        Helper.error()
        return
      }

      const data = {
        _id: car._id,
        name,
        company: company._id,
        minimumAge: Number.parseInt(minimumAge, 10),
        locations: locations.map((l) => l._id),
        price: Number(price),
        deposit: Number(deposit),
        available,
        type,
        gearbox,
        aircon,
        image,
        seats: Number.parseInt(seats, 10),
        doors: Number.parseInt(doors, 10),
        fuelPolicy,
        mileage: extraToNumber(mileage),
        cancellation: extraToNumber(cancellation),
        amendments: extraToNumber(amendments),
        theftProtection: extraToNumber(theftProtection),
        collisionDamageWaiver: extraToNumber(collisionDamageWaiver),
        fullInsurance: extraToNumber(fullInsurance),
        additionalDriver: extraToNumber(additionalDriver),
      }

      const status = await CarService.update(data)

      if (status === 200) {
        Helper.info(commonStrings.UPDATED)
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    if (_user && _user.verified) {
      setLoading(true)
      setUser(_user)
      const params = new URLSearchParams(window.location.search)
      if (params.has('cr')) {
        const id = params.get('cr')
        if (id && id !== '') {
          try {
            const _car = await CarService.getCar(id)

            if (_car) {
              if (_user.type === bookcarsTypes.RecordType.Company && _user._id !== _car.company._id) {
                setLoading(false)
                setNoMatch(true)
                return
              }

              const _company = {
                _id: _car.company._id as string,
                name: _car.company.fullName,
                image: _car.company.avatar,
              }

              setCar(_car)
              setImageRequired(!_car.image)
              setName(_car.name)
              setCompany(_company)
              setMinimumAge(_car.minimumAge.toString())
              const lcs: bookcarsTypes.Option[] = []
              for (const loc of _car.locations) {
                const { _id, name: _name } = loc
                const lc: bookcarsTypes.Option = { _id, name: _name ?? '' }
                lcs.push(lc)
              }
              setLocations(lcs)
              setPrice(_car.price.toString())
              setDeposit(_car.deposit.toString())
              setAvailable(_car.available)
              setType(_car.type)
              setGearbox(_car.gearbox)
              setAircon(_car.aircon)
              setSeats(_car.seats.toString())
              setDoors(_car.doors.toString())
              setFuelPolicy(_car.fuelPolicy)
              setMileage(extraToString(_car.mileage))
              setCancellation(extraToString(_car.cancellation))
              setAmendments(extraToString(_car.amendments))
              setTheftProtection(extraToString(_car.theftProtection))
              setCollisionDamageWaiver(extraToString(_car.collisionDamageWaiver))
              setFullInsurance(extraToString(_car.fullInsurance))
              setAdditionalDriver(extraToString(_car.additionalDriver))
              setVisible(true)
              setLoading(false)
            } else {
              setLoading(false)
              setNoMatch(true)
            }
          } catch (err) {
            Helper.error(err)
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

  const admin = user && user.type === bookcarsTypes.RecordType.Admin

  return (
    <Master onLoad={onLoad} strict>
      {!error && !noMatch && (
        <div className="update-car">
          <Paper className="car-form car-form-wrapper" elevation={10} style={visible ? {} : { display: 'none' }}>
            <form onSubmit={handleSubmit}>
              <Avatar
                type={bookcarsTypes.RecordType.Car}
                mode="update"
                record={car}
                hideDelete
                size="large"
                readonly={false}
                onBeforeUpload={handleBeforeUpload}
                onChange={handleImageChange}
                onValidate={handleImageValidate}
                color="disabled"
                className="avatar-ctn"
              />

              <div className="info">
                <InfoIcon />
                <span>{strings.RECOMMENDED_IMAGE_SIZE}</span>
              </div>

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{strings.NAME}</InputLabel>
                <Input type="text" required value={name} autoComplete="off" onChange={handleNameChange} />
              </FormControl>

              {admin && (
                <FormControl fullWidth margin="dense">
                  <SupplierSelectList
                    label={strings.COMPANY}
                    required
                    value={company}
                    variant="standard"
                    onChange={handleCompanyChange}
                  />
                </FormControl>
              )}

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{strings.MINIMUM_AGE}</InputLabel>
                <Input
                  type="text"
                  required
                  error={!minimumAgeValid}
                  value={minimumAge}
                  autoComplete="off"
                  onChange={handleMinimumAgeChange}
                  inputProps={{ inputMode: 'numeric', pattern: '^\\d{2}$' }}
                />
                <FormHelperText error={!minimumAgeValid}>{(!minimumAgeValid && strings.MINIMUM_AGE_NOT_VALID) || ''}</FormHelperText>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <LocationSelectList label={strings.LOCATIONS} multiple required variant="standard" value={locations} onChange={handleLocationsChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${strings.PRICE} (${csStrings.CAR_CURRENCY})`}
                  // eslint-disable-next-line
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  }}
                  onChange={handlePriceChange}
                  required
                  variant="standard"
                  autoComplete="off"
                  value={price}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.DEPOSIT} (${commonStrings.CURRENCY})`}
                  // eslint-disable-next-line
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  }}
                  onChange={handleDepositChange}
                  required
                  variant="standard"
                  autoComplete="off"
                  value={deposit}
                />
              </FormControl>

              <FormControl fullWidth margin="dense" className="checkbox-fc">
                <FormControlLabel control={<Switch checked={available} onChange={handleAvailableChange} color="primary" />} label={strings.AVAILABLE} className="checkbox-fcl" />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <CarTypeList label={strings.CAR_TYPE} variant="standard" required value={type} onChange={handleCarTypeChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <GearboxList label={strings.GEARBOX} variant="standard" required value={gearbox} onChange={handleGearboxChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <SeatsList label={strings.SEATS} variant="standard" required value={seats} onChange={handleSeatsChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <DoorsList label={strings.DOORS} variant="standard" required value={doors} onChange={handleDoorsChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <FuelPolicyList label={csStrings.FUEL_POLICY} variant="standard" required value={fuelPolicy} onChange={handleFuelPolicyChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <div className="info">
                  <InfoIcon />
                  <span>{commonStrings.OPTIONAL}</span>
                </div>
              </FormControl>

              <FormControl fullWidth margin="dense" className="checkbox-fc">
                <FormControlLabel control={<Switch checked={aircon} onChange={handleAirconChange} color="primary" />} label={strings.AIRCON} className="checkbox-fcl" />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.MILEAGE} (${csStrings.MILEAGE_UNIT})`}
                  // eslint-disable-next-line
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  }}
                  onChange={handleMileageChange}
                  variant="standard"
                  autoComplete="off"
                  value={mileage}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.CANCELLATION} (${commonStrings.CURRENCY})`}
                  // eslint-disable-next-line
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  }}
                  onChange={handleCancellationChange}
                  variant="standard"
                  autoComplete="off"
                  value={cancellation}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.AMENDMENTS} (${commonStrings.CURRENCY})`}
                  // eslint-disable-next-line
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  }}
                  onChange={handleAmendmentsChange}
                  variant="standard"
                  autoComplete="off"
                  value={amendments}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.THEFT_PROTECTION} (${csStrings.CAR_CURRENCY})`}
                  // eslint-disable-next-line
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  }}
                  onChange={handleTheftProtectionChange}
                  variant="standard"
                  autoComplete="off"
                  value={theftProtection}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.COLLISION_DAMAGE_WAVER} (${csStrings.CAR_CURRENCY})`}
                  // eslint-disable-next-line
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  }}
                  onChange={handleCollisionDamageWaiverChange}
                  variant="standard"
                  autoComplete="off"
                  value={collisionDamageWaiver}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.FULL_INSURANCE} (${csStrings.CAR_CURRENCY})`}
                  // eslint-disable-next-line
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  }}
                  onChange={handleFullinsuranceChange}
                  variant="standard"
                  autoComplete="off"
                  value={fullInsurance}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.ADDITIONAL_DRIVER} (${csStrings.CAR_CURRENCY})`}
                  // eslint-disable-next-line
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  }}
                  onChange={handleAdditionalDriverChange}
                  variant="standard"
                  autoComplete="off"
                  value={additionalDriver}
                />
              </FormControl>

              <div className="buttons">
                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.SAVE}
                </Button>
                <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" href="/cars">
                  {commonStrings.CANCEL}
                </Button>
              </div>

              <div className="form-error">
                {imageRequired && <ErrorMessage message={commonStrings.IMAGE_REQUIRED} />}
                {imageSizeError && <ErrorMessage message={strings.CAR_IMAGE_SIZE_ERROR} />}
                {formError && <ErrorMessage message={commonStrings.FORM_ERROR} />}
              </div>
            </form>
          </Paper>
        </div>
      )}
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      {error && <Error />}
      {noMatch && <NoMatch hideHeader />}
    </Master>
  )
}

export default UpdateCar
