import React, { useState, useEffect } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material'
import {
  LocalGasStation as FuelIcon,
  AccountTree as GearboxIcon,
  Person as SeatsIcon,
  AcUnit as AirconIcon,
  DirectionsCar as MileageIcon,
  Check as CheckIcon,
  Clear as UncheckIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import * as bookcarsTypes from 'bookcars-types'
import * as bookcarsHelper from 'bookcars-helper'
import Master from '../components/Master'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/cars'
import * as CarService from '../services/CarService'
import * as SupplierService from '../services/SupplierService'
import Backdrop from '../components/SimpleBackdrop'
import NoMatch from './NoMatch'
import Error from './Error'
import Avatar from '../components/Avatar'
import BookingList from '../components/BookingList'
import * as Helper from '../common/Helper'

import DoorsIcon from '../assets/img/car-door.png'
import '../assets/css/car.css'

function Car() {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [car, setCar] = useState<bookcarsTypes.Car>()
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [companies, setCompanies] = useState<string[]>([])
  const [offset, setOffset] = useState(0)
  const [openInfoDialog, setOpenInfoDialog] = useState(false)

  useEffect(() => {
    if (visible) {
      const col1 = document.querySelector('.col-1')
      if (col1) {
        setOffset(col1.clientHeight)
      }
    }
  }, [visible])

  const handleBeforeUpload = () => {
    setLoading(true)
  }

  const handleImageChange = () => {
    setLoading(false)
  }

  const handleCloseInfo = () => {
    setOpenInfoDialog(false)
  }

  const handleDelete = async () => {
    try {
      if (car) {
        const status = await CarService.check(car._id)

        if (status === 200) {
          setOpenInfoDialog(true)
        } else if (status === 204) {
          setOpenDeleteDialog(true)
        } else {
          Helper.error()
        }
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false)
  }

  const handleConfirmDelete = async () => {
    try {
      if (car) {
        setOpenDeleteDialog(false)

        const status = await CarService.deleteCar(car._id)

        if (status === 200) {
          window.location.href = '/cars'
        } else {
          Helper.error()
          setLoading(false)
        }
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    setLoading(true)
    setUser(_user)

    const params = new URLSearchParams(window.location.search)
    if (_user && _user.verified && params.has('cr')) {
      const id = params.get('cr')
      if (id && id !== '') {
        try {
          const _car = await CarService.getCar(id)

          if (_car) {
            if (_user.type === bookcarsTypes.RecordType.Admin) {
              try {
                const _companies = await SupplierService.getAllSuppliers()
                const companyIds = bookcarsHelper.flattenCompanies(_companies)
                setCompanies(companyIds)
                setCar(_car)
                setVisible(true)
                setLoading(false)
              } catch (err) {
                Helper.error(err)
              }
            } else if (_car.company._id === _user._id) {
              setCompanies([_user._id as string])
              setCar(_car)
              setVisible(true)
              setLoading(false)
            } else {
              setLoading(false)
              setNoMatch(true)
            }
          } else {
            setLoading(false)
            setNoMatch(true)
          }
        } catch {
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

  const edit = user && car && car.company && (user.type === bookcarsTypes.RecordType.Admin || user._id === car.company._id)
  const statuses = Helper.getBookingStatuses().map((status) => status.value)
  const fr = (user && user.language === 'fr') || false

  return (
    <Master onLoad={onLoad} strict>
      {visible && car && car.company && (
        <div className="car">
          <div className="col-1">
            <section className="car-sec">
              <div className="name">
                <h2>{car.name}</h2>
              </div>
              <div className="car-img">
                <Avatar
                  type={bookcarsTypes.RecordType.Car}
                  mode="update"
                  record={car}
                  size="large"
                  readonly={!edit}
                  hideDelete
                  onBeforeUpload={handleBeforeUpload}
                  onChange={handleImageChange}
                  color="disabled"
                  className="avatar-ctn"
                />
                <div className="car-company">
                  <span className="car-company-logo">
                    <img src={bookcarsHelper.joinURL(Env.CDN_USERS, car.company.avatar)} alt={car.company.fullName} />
                  </span>
                  <span className="car-company-info">{car.company.fullName}</span>
                </div>
              </div>
              <div className="price">{`${bookcarsHelper.formatNumber(car.price)} ${strings.CAR_CURRENCY}`}</div>
              <div className="car-info">
                <ul className="car-info-list">
                  <li className="car-type">
                    <Tooltip title={Helper.getCarTypeTooltip(car.type)} placement="top">
                      <div className="car-info-list-item">
                        <FuelIcon />
                        <span className="car-info-list-text">{Helper.getCarTypeShort(car.type)}</span>
                      </div>
                    </Tooltip>
                  </li>
                  <li className="gearbox">
                    <Tooltip title={Helper.getGearboxTooltip(car.gearbox)} placement="top">
                      <div className="car-info-list-item">
                        <GearboxIcon />
                        <span className="car-info-list-text">{Helper.getGearboxTypeShort(car.gearbox)}</span>
                      </div>
                    </Tooltip>
                  </li>
                  <li className="seats">
                    <Tooltip title={Helper.getSeatsTooltip(car.seats)} placement="top">
                      <div className="car-info-list-item">
                        <SeatsIcon />
                        <span className="car-info-list-text">{car.seats}</span>
                      </div>
                    </Tooltip>
                  </li>
                  <li className="doors">
                    <Tooltip title={Helper.getDoorsTooltip(car.doors)} placement="top">
                      <div className="car-info-list-item">
                        <img src={DoorsIcon} alt="" className="car-doors" />
                        <span className="car-info-list-text">{car.doors}</span>
                      </div>
                    </Tooltip>
                  </li>
                  {car.aircon && (
                    <li className="aircon">
                      <Tooltip title={strings.AIRCON_TOOLTIP} placement="top">
                        <div className="car-info-list-item">
                          <AirconIcon />
                        </div>
                      </Tooltip>
                    </li>
                  )}
                  <li className="mileage">
                    <Tooltip title={Helper.getMileageTooltip(car.mileage, fr)} placement="left">
                      <div className="car-info-list-item">
                        <MileageIcon />
                        <span className="car-info-list-text">{`${strings.MILEAGE}${fr ? ' : ' : ': '}${Helper.getMileage(car.mileage)}`}</span>
                      </div>
                    </Tooltip>
                  </li>
                  <li className="fuel-policy">
                    <Tooltip title={Helper.getFuelPolicyTooltip(car.fuelPolicy)} placement="left">
                      <div className="car-info-list-item">
                        <FuelIcon />
                        <span className="car-info-list-text">{`${strings.FUEL_POLICY}${fr ? ' : ' : ': '}${Helper.getFuelPolicy(car.fuelPolicy)}`}</span>
                      </div>
                    </Tooltip>
                  </li>
                </ul>
                <ul className="extras-list">
                  <li className={car.available ? 'car-available' : 'car-unavailable'}>
                    <Tooltip title={car.available ? strings.CAR_AVAILABLE_TOOLTIP : strings.CAR_UNAVAILABLE_TOOLTIP}>
                      <div className="car-info-list-item">
                        {car.available ? <CheckIcon /> : <UncheckIcon />}
                        {car.available ? <span className="car-info-list-text">{strings.CAR_AVAILABLE}</span> : <span className="car-info-list-text">{strings.CAR_UNAVAILABLE}</span>}
                      </div>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip title={car.cancellation > -1 ? strings.CANCELLATION_TOOLTIP : Helper.getCancellation(car.cancellation, fr)} placement="left">
                      <div className="car-info-list-item">
                        {car.cancellation > -1 ? <CheckIcon /> : <UncheckIcon />}
                        <span className="car-info-list-text">{Helper.getCancellation(car.cancellation, fr)}</span>
                      </div>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip title={car.amendments > -1 ? strings.AMENDMENTS_TOOLTIP : Helper.getAmendments(car.amendments, fr)} placement="left">
                      <div className="car-info-list-item">
                        {car.amendments > -1 ? <CheckIcon /> : <UncheckIcon />}
                        <span className="car-info-list-text">{Helper.getAmendments(car.amendments, fr)}</span>
                      </div>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip title={car.theftProtection > -1 ? strings.THEFT_PROTECTION_TOOLTIP : Helper.getTheftProtection(car.theftProtection, fr)} placement="left">
                      <div className="car-info-list-item">
                        {car.theftProtection > -1 ? <CheckIcon /> : <UncheckIcon />}
                        <span className="car-info-list-text">{Helper.getTheftProtection(car.theftProtection, fr)}</span>
                      </div>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip
                      title={car.collisionDamageWaiver > -1 ? strings.COLLISION_DAMAGE_WAVER_TOOLTIP : Helper.getCollisionDamageWaiver(car.collisionDamageWaiver, fr)}
                      placement="left"
                    >
                      <div className="car-info-list-item">
                        {car.collisionDamageWaiver > -1 ? <CheckIcon /> : <UncheckIcon />}
                        <span className="car-info-list-text">{Helper.getCollisionDamageWaiver(car.collisionDamageWaiver, fr)}</span>
                      </div>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip title={car.fullInsurance > -1 ? strings.FULL_INSURANCE_TOOLTIP : Helper.getFullInsurance(car.fullInsurance, fr)} placement="left">
                      <div className="car-info-list-item">
                        {car.fullInsurance > -1 ? <CheckIcon /> : <UncheckIcon />}
                        <span className="car-info-list-text">{Helper.getFullInsurance(car.fullInsurance, fr)}</span>
                      </div>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip title={Helper.getAdditionalDriver(car.additionalDriver, fr)} placement="left">
                      <div className="car-info-list-item">
                        {car.additionalDriver > -1 ? <CheckIcon /> : <UncheckIcon />}
                        <span className="car-info-list-text">{Helper.getAdditionalDriver(car.additionalDriver, fr)}</span>
                      </div>
                    </Tooltip>
                  </li>
                </ul>
                <ul className="locations-list">
                  {car.locations.map((location) => (
                    <li key={location._id}>
                      <div className="car-info-list-item">
                        <LocationIcon />
                        <span className="car-info-list-text">{location.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
            {edit && (
              <section className="buttons action">
                <Button variant="contained" className="btn-primary btn-margin btn-margin-bottom" size="small" href={`/update-car?cr=${car._id}`}>
                  {commonStrings.UPDATE}
                </Button>
                <Button variant="contained" className="btn-margin-bottom" color="error" size="small" onClick={handleDelete}>
                  {commonStrings.DELETE}
                </Button>
              </section>
            )}
          </div>
          <div className="col-2">
            <BookingList
              containerClassName="car"
              offset={offset}
              loggedUser={user}
              companies={companies}
              statuses={statuses}
              car={car._id}
              hideCompanyColumn
              hideCarColumn
              hideDates={Env.isMobile()}
              checkboxSelection={!Env.isMobile()}
            />
          </div>
        </div>
      )}
      <Dialog disableEscapeKeyDown maxWidth="xs" open={openInfoDialog}>
        <DialogTitle className="dialog-header">{commonStrings.INFO}</DialogTitle>
        <DialogContent>{strings.CANNOT_DELETE_CAR}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseInfo} variant="contained" className="btn-secondary">
            {commonStrings.CLOSE}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog disableEscapeKeyDown maxWidth="xs" open={openDeleteDialog}>
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{strings.DELETE_CAR}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCancelDelete} variant="contained" className="btn-secondary">
            {commonStrings.CANCEL}
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            {commonStrings.DELETE}
          </Button>
        </DialogActions>
      </Dialog>
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      {error && <Error />}
      {noMatch && <NoMatch hideHeader />}
    </Master>
  )
}

export default Car
