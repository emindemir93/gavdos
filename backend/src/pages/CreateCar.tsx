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
import { useNavigate } from 'react-router-dom'
import * as bookcarsTypes from 'bookcars-types'
import Master from '../components/Master'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as csStrings } from '../lang/cars'
import { strings } from '../lang/create-car'
import * as CarService from '../services/CarService'
import * as Helper from '../common/Helper'
import Error from '../components/Error'
import Backdrop from '../components/SimpleBackdrop'
import Avatar from '../components/Avatar'
import SupplierSelectList from '../components/SupplierSelectList'
import LocationSelectList from '../components/LocationSelectList'
import CarTypeList from '../components/CarTypeList'
import GearboxList from '../components/GearboxList'
import SeatsList from '../components/SeatsList'
import DoorsList from '../components/DoorsList'
import FuelPolicyList from '../components/FuelPolicyList'

import '../assets/css/create-car.css'

function CreateCar() {
  const navigate = useNavigate()
  const [isCompany, setIsCompany] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageSizeError, setImageSizeError] = useState(false)
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
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

  const handleImageChange = (_image: bookcarsTypes.Car | string | null) => {
    setLoading(false)
    setImage(_image as string)

    if (_image !== null) {
      setImageError(false)
    }
  }

  const handleImageValidate = (valid: boolean) => {
    if (!valid) {
      setImageSizeError(true)
      setImageError(false)
      setFormError(false)
      setLoading(false)
    } else {
      setImageSizeError(false)
      setImageError(false)
      setFormError(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleCompanyChange = (values: bookcarsTypes.Option[]) => {
    setCompany(values.length > 0 ? values[0]._id : '')
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

  const extraToNumber = (extra: string) => (extra === '' ? -1 : Number(extra))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const _minimumAgeValid = validateMinimumAge(minimumAge)
      if (!_minimumAgeValid) {
        setFormError(true)
        setImageError(false)
        return
      }

      if (!image) {
        setImageError(true)
        setImageSizeError(false)
        return
      }

      const data = {
        name,
        company,
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

      const car = await CarService.create(data)

      if (car && car._id) {
        navigate('/cars')
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const onLoad = (user?: bookcarsTypes.User) => {
    if (user && user.verified) {
      setVisible(true)

      if (user.type === bookcarsTypes.RecordType.Company) {
        setCompany(user._id as string)
        setIsCompany(true)
      }
    }
  }

  return (
    <Master onLoad={onLoad} strict>
      <div className="create-car">
        <Paper className="car-form car-form-wrapper" elevation={10} style={visible ? {} : { display: 'none' }}>
          <h1 className="car-form-title">
            {' '}
            {strings.NEW_CAR_HEADING}
            {' '}
          </h1>
          <form onSubmit={handleSubmit}>
            <Avatar
              type={bookcarsTypes.RecordType.Car}
              mode="create"
              record={null}
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

            {!isCompany && (
              <FormControl fullWidth margin="dense">
                <SupplierSelectList
                  label={strings.COMPANY}
                  required
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
              <LocationSelectList label={strings.LOCATIONS} multiple required variant="standard" onChange={handleLocationsChange} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <TextField
                label={`${strings.PRICE} (${csStrings.CAR_CURRENCY})`}
                // eslint-disable-next-line
                inputProps={{ inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' }}
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
                inputProps={{ inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' }}
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
              <CarTypeList label={strings.CAR_TYPE} variant="standard" required onChange={handleCarTypeChange} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <GearboxList label={strings.GEARBOX} variant="standard" required onChange={handleGearboxChange} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <SeatsList label={strings.SEATS} variant="standard" required onChange={handleSeatsChange} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <DoorsList label={strings.DOORS} variant="standard" required onChange={handleDoorsChange} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FuelPolicyList label={csStrings.FUEL_POLICY} variant="standard" required onChange={handleFuelPolicyChange} />
            </FormControl>

            <div className="info">
              <InfoIcon />
              <span>{commonStrings.OPTIONAL}</span>
            </div>

            <FormControl fullWidth margin="dense" className="checkbox-fc">
              <FormControlLabel control={<Switch checked={aircon} onChange={handleAirconChange} color="primary" />} label={strings.AIRCON} className="checkbox-fcl" />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <TextField
                label={`${csStrings.MILEAGE} (${csStrings.MILEAGE_UNIT})`}
                // eslint-disable-next-line
                inputProps={{ inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' }}
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
                inputProps={{ inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' }}
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
                inputProps={{ inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' }}
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
                inputProps={{ inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' }}
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
                inputProps={{ inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' }}
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
                inputProps={{ inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' }}
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
                inputProps={{ inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' }}
                onChange={handleAdditionalDriverChange}
                variant="standard"
                autoComplete="off"
                value={additionalDriver}
              />
            </FormControl>

            <div className="buttons">
              <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                {commonStrings.CREATE}
              </Button>
              <Button
                variant="contained"
                className="btn-secondary btn-margin-bottom"
                size="small"
                onClick={async () => {
                  if (image) {
                    await CarService.deleteTempImage(image)
                    navigate('/cars')
                  }
                }}
              >
                {commonStrings.CANCEL}
              </Button>
            </div>

            <div className="form-error">
              {imageError && <Error message={commonStrings.IMAGE_REQUIRED} />}
              {imageSizeError && <Error message={strings.CAR_IMAGE_SIZE_ERROR} />}
              {formError && <Error message={commonStrings.FORM_ERROR} />}
            </div>
          </form>
        </Paper>
      </div>
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </Master>
  )
}

export default CreateCar
