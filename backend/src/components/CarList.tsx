import React, { useState, useEffect } from 'react'
import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Card,
  CardContent,
  Typography
} from '@mui/material'
import {
  LocalGasStation as FuelIcon,
  AccountTree as GearboxIcon,
  Person as SeatsIcon,
  AcUnit as AirconIcon,
  DirectionsCar as MileageIcon,
  Check as CheckIcon,
  Clear as UncheckIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import * as bookcarsTypes from 'bookcars-types'
import * as bookcarsHelper from 'bookcars-helper'
import Env from '../config/env.config'
import Const from '../config/const'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/cars'
import * as Helper from '../common/Helper'
import * as CarService from '../services/CarService'
import Pager from './Pager'

import DoorsIcon from '../assets/img/car-door.png'

import '../assets/css/car-list.css'

interface CarListProps {
  companies?: string[]
  keyword?: string
  fuel?: string[]
  gearbox?: string[]
  mileage?: string[]
  deposit?: number
  availability?: string[]
  reload?: boolean
  cars?: bookcarsTypes.Car[]
  user?: bookcarsTypes.User
  booking?: bookcarsTypes.Booking
  className?: string
  loading?: boolean
  hideCompany?: boolean
  hidePrice?: boolean
  onLoad?: bookcarsTypes.DataEvent<bookcarsTypes.Car>
  onDelete?: (rowCount: number) => void
}

function CarList({
  companies: carCompanies,
  keyword: carKeyword,
  fuel: carFuel,
  gearbox: carGearbox,
  mileage: carMileage,
  deposit: carDeposit,
  availability: carAvailability,
  reload,
  cars,
  user: carUser,
  booking,
  className,
  loading: carLoading,
  hideCompany,
  hidePrice,
  onLoad,
  onDelete
}: CarListProps) {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [init, setInit] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetch, setFetch] = useState(false)
  const [rows, setRows] = useState<bookcarsTypes.Car[]>([])
  const [page, setPage] = useState(1)
  const [rowCount, setRowCount] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [carId, setCarId] = useState('')
  const [carIndex, setCarIndex] = useState(-1)
  const [openInfoDialog, setOpenInfoDialog] = useState(false)

  useEffect(() => {
    if (Env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || Env.isMobile()) {
      const element = document.querySelector('body')

      if (element) {
        element.onscroll = () => {
          if (fetch
            && !loading
            && window.scrollY > 0
            && window.scrollY + window.innerHeight + Env.INFINITE_SCROLL_OFFSET >= document.body.scrollHeight) {
            setLoading(true)
            setPage(page + 1)
          }
        }
      }
    }
  }, [fetch, loading, page])

  const _fetch = async (
    _page: number,
    companies?: string[],
    keyword?: string,
    fuel?: string[],
    gearbox?: string[],
    mileage?: string[],
    deposit?: number,
    availability?: string[]
  ) => {
    try {
      setLoading(true)

      const payload: bookcarsTypes.GetCarsPayload = {
        companies: companies ?? [],
        fuel,
        gearbox,
        mileage,
        deposit,
        availability,
      }
      const data = await CarService.getCars(keyword || '', payload, _page, Env.CARS_PAGE_SIZE)

      const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
      if (!_data) {
        Helper.error()
        return
      }
      const _totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

      let _rows: bookcarsTypes.Car[] = []
      if (Env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || Env.isMobile()) {
        _rows = _page === 1 ? _data.resultData : [...rows, ..._data.resultData]
      } else {
        _rows = _data.resultData
      }

      setRows(_rows)
      setRowCount((_page - 1) * Env.CARS_PAGE_SIZE + _rows.length)
      setTotalRecords(_totalRecords)
      setFetch(_data.resultData.length > 0)

      if (((Env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || Env.isMobile()) && _page === 1) || (Env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !Env.isMobile())) {
        window.scrollTo(0, 0)
      }

      if (onLoad) {
        onLoad({ rows: _data.resultData, rowCount: _totalRecords })
      }
    } catch (err) {
      Helper.error(err)
    } finally {
      setLoading(false)
      setInit(false)
    }
  }

  useEffect(() => {
    if (carCompanies) {
      if (carCompanies.length > 0) {
        _fetch(
          page,
          carCompanies,
          carKeyword,
          carFuel,
          carGearbox,
          carMileage,
          carDeposit || 0,
          carAvailability
        )
      } else {
        setRows([])
        setRowCount(0)
        setFetch(false)
        if (onLoad) {
          onLoad({ rows: [], rowCount: 0 })
        }
        setInit(false)
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    carCompanies,
    carKeyword,
    carFuel,
    carGearbox,
    carMileage,
    carDeposit,
    carAvailability
  ])

  useEffect(() => {
    if (cars) {
      setRows(cars)
      setRowCount(cars.length)
      setFetch(false)
      if (onLoad) {
        onLoad({ rows: cars, rowCount: cars.length })
      }
      // setLoading(false)
    }
  }, [cars]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1)
  }, [
    carCompanies,
    carKeyword,
    carFuel,
    carGearbox,
    carMileage,
    carDeposit,
    carAvailability
  ])

  useEffect(() => {
    if (reload) {
      setPage(1)
      _fetch(
        1,
        carCompanies,
        carKeyword,
        carFuel,
        carGearbox,
        carMileage,
        carDeposit,
        carAvailability
      )
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reload,
    carCompanies,
    carKeyword,
    carFuel,
    carGearbox,
    carMileage,
    carDeposit,
    carAvailability
  ])

  useEffect(() => {
    setUser(carUser)
  }, [carUser])

  const handleDelete = async (e: React.MouseEvent<HTMLElement>) => {
    try {
      const _carId = e.currentTarget.getAttribute('data-id') as string
      const _carIndex = Number(e.currentTarget.getAttribute('data-index') as string)

      const status = await CarService.check(_carId)

      if (status === 200) {
        setOpenInfoDialog(true)
      } else if (status === 204) {
        setOpenDeleteDialog(true)
        setCarId(_carId)
        setCarIndex(_carIndex)
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const handleCloseInfo = () => {
    setOpenInfoDialog(false)
  }

  const handleConfirmDelete = async () => {
    try {
      if (carId !== '' && carIndex > -1) {
        setOpenDeleteDialog(false)

        const status = await CarService.deleteCar(carId)

        if (status === 200) {
          const _rowCount = rowCount - 1
          rows.splice(carIndex, 1)
          setRows(rows)
          setRowCount(_rowCount)
          setTotalRecords(totalRecords - 1)
          setCarId('')
          setCarIndex(-1)
          if (onDelete) {
            onDelete(_rowCount)
          }
          setLoading(false)
        } else {
          Helper.error()
          setCarId('')
          setCarIndex(-1)
          setLoading(false)
        }
      } else {
        Helper.error()
        setCarId('')
        setCarIndex(-1)
        setOpenDeleteDialog(false)
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false)
    setCarId('')
  }

  const getExtraIcon = (option: string, extra: number) => {
    let available = false
    if (booking) {
      if (option === 'cancellation' && booking.cancellation && extra > 0) {
        available = true
      }
      if (option === 'amendments' && booking.amendments && extra > 0) {
        available = true
      }
      if (option === 'collisionDamageWaiver' && booking.collisionDamageWaiver && extra > 0) {
        available = true
      }
      if (option === 'theftProtection' && booking.theftProtection && extra > 0) {
        available = true
      }
      if (option === 'fullInsurance' && booking.fullInsurance && extra > 0) {
        available = true
      }
      if (option === 'additionalDriver' && booking.additionalDriver && extra > 0) {
        available = true
      }
    }

    return extra === -1
      ? <UncheckIcon className="unavailable" />
      : extra === 0 || available
        ? <CheckIcon className="available" />
        : <InfoIcon className="extra-info" />
  }

  const admin = Helper.admin(user)
  const fr = (user && user.language === 'fr') || false

  return (
    (user && (
      <>
        <section className={`${className ? `${className} ` : ''}car-list`}>
          {rows.length === 0
            ? !init
            && !loading
            && !carLoading
            && (
              <Card variant="outlined" className="empty-list">
                <CardContent>
                  <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
                </CardContent>
              </Card>
            )
            : rows.map((car, index) => {
              const edit = admin || car.company._id === user._id
              return (
                <article key={car._id}>
                  <div className="name">
                    <h2>{car.name}</h2>
                  </div>
                  <div className="car">
                    <img src={bookcarsHelper.joinURL(Env.CDN_CARS, car.image)} alt={car.name} className="car-img" />
                    {!hideCompany && (
                      <div className="car-company">
                        <span className="car-company-logo">
                          <img src={bookcarsHelper.joinURL(Env.CDN_USERS, car.company.avatar)} alt={car.company.fullName} />
                        </span>
                        <a href={`/supplier?c=${car.company._id}`} className="car-company-info">
                          {car.company.fullName}
                        </a>
                      </div>
                    )}
                  </div>
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
                      {edit && (
                        <li className={car.available ? 'car-available' : 'car-unavailable'}>
                          <Tooltip title={car.available ? strings.CAR_AVAILABLE_TOOLTIP : strings.CAR_UNAVAILABLE_TOOLTIP}>
                            <div className="car-info-list-item">
                              {car.available ? <CheckIcon /> : <UncheckIcon />}
                              {car.available ? <span className="car-info-list-text">{strings.CAR_AVAILABLE}</span> : <span className="car-info-list-text">{strings.CAR_UNAVAILABLE}</span>}
                            </div>
                          </Tooltip>
                        </li>
                      )}
                      <li>
                        <Tooltip title={booking ? '' : car.cancellation > -1 ? strings.CANCELLATION_TOOLTIP : Helper.getCancellation(car.cancellation, fr)} placement="left">
                          <div className="car-info-list-item">
                            {getExtraIcon('cancellation', car.cancellation)}
                            <span className="car-info-list-text">{Helper.getCancellation(car.cancellation, fr)}</span>
                          </div>
                        </Tooltip>
                      </li>
                      <li>
                        <Tooltip title={booking ? '' : car.amendments > -1 ? strings.AMENDMENTS_TOOLTIP : Helper.getAmendments(car.amendments, fr)} placement="left">
                          <div className="car-info-list-item">
                            {getExtraIcon('amendments', car.amendments)}
                            <span className="car-info-list-text">{Helper.getAmendments(car.amendments, fr)}</span>
                          </div>
                        </Tooltip>
                      </li>
                      <li>
                        <Tooltip
                          title={
                            booking ? '' : car.collisionDamageWaiver > -1 ? strings.COLLISION_DAMAGE_WAVER_TOOLTIP : Helper.getCollisionDamageWaiver(car.collisionDamageWaiver, fr)
                          }
                          placement="left"
                        >
                          <div className="car-info-list-item">
                            {getExtraIcon('collisionDamageWaiver', car.collisionDamageWaiver)}
                            <span className="car-info-list-text">{Helper.getCollisionDamageWaiver(car.collisionDamageWaiver, fr)}</span>
                          </div>
                        </Tooltip>
                      </li>
                      <li>
                        <Tooltip
                          title={booking ? '' : car.theftProtection > -1 ? strings.THEFT_PROTECTION_TOOLTIP : Helper.getTheftProtection(car.theftProtection, fr)}
                          placement="left"
                        >
                          <div className="car-info-list-item">
                            {getExtraIcon('theftProtection', car.theftProtection)}
                            <span className="car-info-list-text">{Helper.getTheftProtection(car.theftProtection, fr)}</span>
                          </div>
                        </Tooltip>
                      </li>
                      <li>
                        <Tooltip title={booking ? '' : car.fullInsurance > -1 ? strings.FULL_INSURANCE_TOOLTIP : Helper.getFullInsurance(car.fullInsurance, fr)} placement="left">
                          <div className="car-info-list-item">
                            {getExtraIcon('fullInsurance', car.fullInsurance)}
                            <span className="car-info-list-text">{Helper.getFullInsurance(car.fullInsurance, fr)}</span>
                          </div>
                        </Tooltip>
                      </li>
                      <li>
                        <Tooltip title={booking ? '' : Helper.getAdditionalDriver(car.additionalDriver, fr)} placement="left">
                          <div className="car-info-list-item">
                            {getExtraIcon('additionalDriver', car.additionalDriver)}
                            <span className="car-info-list-text">{Helper.getAdditionalDriver(car.additionalDriver, fr)}</span>
                          </div>
                        </Tooltip>
                      </li>
                    </ul>
                  </div>
                  {!hidePrice && <div className="price">{`${bookcarsHelper.formatNumber(car.price)} ${strings.CAR_CURRENCY}`}</div>}
                  <div className="action">
                    {edit && (
                      <>
                        <Tooltip title={strings.VIEW_CAR}>
                          <IconButton href={`/car?cr=${car._id}`}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={commonStrings.UPDATE}>
                          <IconButton href={`/update-car?cr=${car._id}`}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={commonStrings.DELETE}>
                          <IconButton data-id={car._id} data-index={index} onClick={handleDelete}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </article>
              )
            })}
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
        </section>
        {Env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !Env.isMobile() && (
          <Pager
            page={page}
            pageSize={Env.CARS_PAGE_SIZE}
            rowCount={rowCount}
            totalRecords={totalRecords}
            onNext={() => setPage(page + 1)}
            onPrevious={() => setPage(page - 1)}
          />
        )}
      </>
    )) || <></>
  )
}

export default CarList
