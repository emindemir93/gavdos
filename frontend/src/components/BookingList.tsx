import React, { useState, useEffect } from 'react'
import {
  DataGrid,
  frFR,
  enUS,
  GridColDef,
  GridPaginationModel,
  GridRowId,
  GridValueGetterParams,
  GridRenderCellParams
} from '@mui/x-data-grid'
import {
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Stack
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Check as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { fr as dfnsFR, enUS as dfnsENUS } from 'date-fns/locale'
import * as bookcarsTypes from 'bookcars-types'
import * as bookcarsHelper from 'bookcars-helper'
import * as BookingService from '../services/BookingService'
import * as Helper from '../common/Helper'
import { strings } from '../lang/booking-list'
import { strings as csStrings } from '../lang/cars'
import { strings as commonStrings } from '../lang/common'
import Env from '../config/env.config'

import '../assets/css/booking-list.css'

interface BookingListProps {
  companies?: string[]
  statuses?: string[]
  filter?: bookcarsTypes.Filter | null
  car?: string
  offset?: number
  user?: bookcarsTypes.User
  containerClassName?: string
  hideDates?: boolean
  hideCarColumn?: boolean
  hideCompanyColumn?: boolean
  language?: string
  loading?: boolean
  checkboxSelection?: boolean
  onLoad?: bookcarsTypes.DataEvent<bookcarsTypes.Booking>
}

function BookingList({
  companies: bookingCompanies,
  statuses: bookingStatuses,
  filter: bookingFilter,
  car: bookingCar,
  offset: bookingOffset,
  user: bookingUser,
  loading: bookingLoading,
  containerClassName,
  hideDates,
  hideCarColumn,
  hideCompanyColumn,
  language,
  checkboxSelection,
  onLoad,
}: BookingListProps) {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(Env.isMobile() ? Env.BOOKINGS_MOBILE_PAGE_SIZE : Env.BOOKINGS_PAGE_SIZE)
  const [columns, setColumns] = useState<GridColDef<bookcarsTypes.Booking>[]>([])
  const [rows, setRows] = useState<bookcarsTypes.Booking[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [fetch, setFetch] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [companies, setCompanies] = useState<string[] | undefined>(bookingCompanies)
  const [statuses, setStatuses] = useState<string[] | undefined>(bookingStatuses)
  const [filter, setFilter] = useState<bookcarsTypes.Filter | undefined | null>(bookingFilter)
  const [car, setCar] = useState<string>(bookingCar || '')
  const [offset, setOffset] = useState(0)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Env.BOOKINGS_PAGE_SIZE,
    page: 0,
  })
  const [init, setInit] = useState(true)
  const [loading, setLoading] = useState(false)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [cancelRequestSent, setCancelRequestSent] = useState(false)
  const [cancelRequestProcessing, setCancelRequestProcessing] = useState(false)

  useEffect(() => {
    setPage(paginationModel.page)
    setPageSize(paginationModel.pageSize)
  }, [paginationModel])

  const _fetch = async (_page: number, _user?: bookcarsTypes.User) => {
    try {
      const _pageSize = Env.isMobile() ? Env.BOOKINGS_MOBILE_PAGE_SIZE : pageSize

      if (companies && statuses) {
        setLoading(true)

        const payload: bookcarsTypes.GetBookingsPayload = {
          companies,
          statuses,
          filter: filter || undefined,
          car,
          user: (_user && _user._id) || undefined,
        }

        const data = await BookingService.getBookings(
          payload,
          _page,
          _pageSize,
        )
        const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
        if (!_data) {
          Helper.error()
          return
        }
        const totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

        if (Env.isMobile()) {
          const _rows = _page === 0 ? _data.resultData : [...rows, ..._data.resultData]
          setRows(_rows)
          setRowCount(totalRecords)
          setFetch(_data.resultData.length > 0)
          if (onLoad) {
            onLoad({ rows: _data.resultData, rowCount: totalRecords })
          }
        } else {
          setRows(_data.resultData)
          setRowCount(totalRecords)
          if (onLoad) {
            onLoad({ rows: _data.resultData, rowCount: totalRecords })
          }
        }
      } else {
        setRows([])
        setRowCount(0)
        if (onLoad) {
          onLoad({ rows: [], rowCount: 0 })
        }
      }
    } catch (err) {
      Helper.error(err)
    } finally {
      setLoading(false)
      setInit(false)
    }
  }

  useEffect(() => {
    setCompanies(bookingCompanies)
  }, [bookingCompanies])

  useEffect(() => {
    setStatuses(bookingStatuses)
  }, [bookingStatuses])

  useEffect(() => {
    setFilter(bookingFilter)
  }, [bookingFilter])

  useEffect(() => {
    setCar(bookingCar || '')
  }, [bookingCar])

  useEffect(() => {
    setOffset(bookingOffset || 0)
  }, [bookingOffset])

  useEffect(() => {
    setUser(bookingUser)
  }, [bookingUser])

  useEffect(() => {
    if (companies && statuses) {
      _fetch(page, user)
    }
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (companies && statuses) {
      if (page === 0) {
        _fetch(0, user)
      } else {
        const _paginationModel = bookcarsHelper.clone(paginationModel)
        _paginationModel.page = 0
        setPaginationModel(_paginationModel)
      }
    }
  }, [pageSize]) // eslint-disable-line react-hooks/exhaustive-deps

  const getDate = (date?: string) => {
    if (date) {
      const d = new Date(date)
      return `${bookcarsHelper.formatDatePart(d.getDate())}-${bookcarsHelper.formatDatePart(d.getMonth() + 1)}-${d.getFullYear()}`
    }

    throw new Error('Invalid date')
  }

  const getColumns = (): GridColDef<bookcarsTypes.Booking>[] => {
    const _columns: GridColDef<bookcarsTypes.Booking>[] = [
      {
        field: 'from',
        headerName: commonStrings.FROM,
        flex: 1,
        valueGetter: ({ value }: GridValueGetterParams<bookcarsTypes.Booking, string>) => getDate(value),
      },
      {
        field: 'to',
        headerName: commonStrings.TO,
        flex: 1,
        valueGetter: ({ value }: GridValueGetterParams<bookcarsTypes.Booking, string>) => getDate(value),
      },
      {
        field: 'price',
        headerName: strings.PRICE,
        flex: 1,
        renderCell: ({ value }: GridRenderCellParams<bookcarsTypes.Booking, string>) => <span className="bp">{value}</span>,
        valueGetter: ({ value }: GridValueGetterParams<bookcarsTypes.Booking, number>) => `${bookcarsHelper.formatNumber(value)} ${commonStrings.CURRENCY}`,
      },
      {
        field: 'status',
        headerName: strings.STATUS,
        flex: 1,
        renderCell: ({ value }: GridRenderCellParams<bookcarsTypes.Booking, bookcarsTypes.BookingStatus>) => <span className={`bs bs-${value?.toLowerCase()}`}>{Helper.getBookingStatus(value)}</span>,
        valueGetter: ({ value }: GridValueGetterParams<bookcarsTypes.Booking, string>) => value,
      },
      {
        field: 'action',
        headerName: '',
        sortable: false,
        disableColumnMenu: true,
        renderCell: ({ row }: GridRenderCellParams<bookcarsTypes.Booking>) => {
          const cancelBooking = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation() // don't select this row after clicking
            setSelectedId(row._id || '')
            setOpenCancelDialog(true)
          }

          const today = new Date()
          today.setHours(0)
          today.setMinutes(0)
          today.setSeconds(0)
          today.setMilliseconds(0)

          return (
            <>
              <Tooltip title={strings.VIEW}>
                <IconButton href={`booking?b=${row._id}`}>
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              {row.cancellation
                && !row.cancelRequest
                && row.status !== bookcarsTypes.BookingStatus.Cancelled
                && new Date(row.from) >= today && (
                  <Tooltip title={strings.CANCEL}>
                    <IconButton onClick={cancelBooking}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                )}
            </>
          )
        },
      },
    ]

    if (hideDates) {
      _columns.splice(0, 2)
    }

    if (!hideCarColumn) {
      _columns.unshift({
        field: 'car',
        headerName: strings.CAR,
        flex: 1,
        valueGetter: ({ value }: GridValueGetterParams<bookcarsTypes.Booking, bookcarsTypes.Car>) => value?.name,
      })
    }

    if (!hideCompanyColumn) {
      _columns.unshift({
        field: 'company',
        headerName: commonStrings.SUPPLIER,
        flex: 1,
        renderCell: ({ row, value }: GridRenderCellParams<bookcarsTypes.Booking, string>) => (
          <div className="cell-company">
            <img src={bookcarsHelper.joinURL(Env.CDN_USERS, (row.company as bookcarsTypes.User).avatar)} alt={value} />
          </div>
        ),
        valueGetter: ({ value }: GridValueGetterParams<bookcarsTypes.Booking, bookcarsTypes.User>) => value?.fullName,
      })
    }

    return _columns
  }

  useEffect(() => {
    if (companies && statuses) {
      const _columns = getColumns()
      setColumns(_columns)

      if (page === 0) {
        _fetch(0, user)
      } else {
        const _paginationModel = bookcarsHelper.clone(paginationModel)
        _paginationModel.page = 0
        setPaginationModel(_paginationModel)
      }
    }
  }, [companies, statuses, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (Env.isMobile()) {
      const element: HTMLDivElement | null = (containerClassName
        ? document.querySelector(`.${containerClassName}`)
        : document.querySelector('div.bookings'))

      if (element) {
        element.onscroll = (event) => {
          const target = event.target as HTMLDivElement
          if (fetch
            && !loading
            && target.scrollTop > 0
            && target.offsetHeight + target.scrollTop + Env.INFINITE_SCROLL_OFFSET >= target.scrollHeight) {
            setLoading(true)
            setPage(page + 1)
          }
        }
      }
    }
  }, [containerClassName, page, fetch, loading, offset]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCloseCancelBooking = () => {
    setOpenCancelDialog(false)
    if (cancelRequestSent) {
      setTimeout(() => {
        setCancelRequestSent(false)
      }, 500)
    }
  }

  const handleConfirmCancelBooking = async () => {
    try {
      setCancelRequestProcessing(true)
      const status = await BookingService.cancel(selectedId)
      if (status === 200) {
        const row = rows.find((r) => r._id === selectedId)
        if (row) {
          row.cancelRequest = true

          setCancelRequestSent(true)
          setRows(rows)
          setSelectedId('')
          setCancelRequestProcessing(false)
        } else {
          Helper.error()
        }
      } else {
        Helper.error()
        setOpenCancelDialog(false)
        setCancelRequestProcessing(false)
      }
    } catch (err) {
      Helper.error(err)
      setOpenCancelDialog(false)
      setCancelRequestProcessing(false)
    }
  }

  const _fr = language === 'fr'
  const _locale = _fr ? dfnsFR : dfnsENUS
  const _format = _fr ? 'eee d LLL kk:mm' : 'eee, d LLL, kk:mm'
  const bookingDetailHeight = Env.COMPANY_IMAGE_HEIGHT + 10

  return (
    <div className="bs-list">
      {user
        && (rows.length === 0 ? (
          !init
          && !loading
          && !bookingLoading
          && (
            <Card variant="outlined" className="empty-list">
              <CardContent>
                <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
              </CardContent>
            </Card>
          )
        ) : Env.isMobile() ? (
          <>
            {rows.map((booking) => {
              const _bookingCar = booking.car as bookcarsTypes.Car
              const bookingSupplier = booking.company as bookcarsTypes.User
              const from = new Date(booking.from)
              const to = new Date(booking.to)
              const days = bookcarsHelper.days(from, to)

              return (
                <div key={booking._id} className="booking-details">
                  <div className={`bs bs-${booking.status}`}>
                    <span>{Helper.getBookingStatus(booking.status)}</span>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <span className="booking-detail-title">{strings.CAR}</span>
                    <div className="booking-detail-value">{`${_bookingCar.name} (${bookcarsHelper.formatNumber(_bookingCar.price)} ${csStrings.CAR_CURRENCY})`}</div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <span className="booking-detail-title">{strings.DAYS}</span>
                    <div className="booking-detail-value">
                      {`${Helper.getDaysShort(bookcarsHelper.days(from, to))} (${bookcarsHelper.capitalize(
                        format(from, _format, { locale: _locale }),
                      )} - ${bookcarsHelper.capitalize(format(to, _format, { locale: _locale }))})`}
                    </div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <span className="booking-detail-title">{commonStrings.PICKUP_LOCATION}</span>
                    <div className="booking-detail-value">{(booking.pickupLocation as bookcarsTypes.Location).name}</div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <span className="booking-detail-title">{commonStrings.DROP_OFF_LOCATION}</span>
                    <div className="booking-detail-value">{(booking.dropOffLocation as bookcarsTypes.Location).name}</div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <span className="booking-detail-title">{commonStrings.SUPPLIER}</span>
                    <div className="booking-detail-value">
                      <div className="car-company">
                        <img src={bookcarsHelper.joinURL(Env.CDN_USERS, bookingSupplier.avatar)} alt={bookingSupplier.fullName} />
                        <span className="car-company-name">{bookingSupplier.fullName}</span>
                      </div>
                    </div>
                  </div>

                  {(booking.cancellation
                    || booking.amendments
                    || booking.collisionDamageWaiver
                    || booking.theftProtection
                    || booking.fullInsurance
                    || booking.additionalDriver) && (
                      <div className="extras">
                        <span className="extras-title">{commonStrings.OPTIONS}</span>
                        {booking.cancellation && (
                          <div className="extra">
                            <CheckIcon className="extra-icon" />
                            <span className="extra-title">{csStrings.CANCELLATION}</span>
                            <span className="extra-text">{Helper.getCancellationOption(_bookingCar.cancellation, _fr)}</span>
                          </div>
                        )}

                        {booking.amendments && (
                          <div className="extra">
                            <CheckIcon className="extra-icon" />
                            <span className="extra-title">{csStrings.AMENDMENTS}</span>
                            <span className="extra-text">{Helper.getAmendmentsOption(_bookingCar.amendments, _fr)}</span>
                          </div>
                        )}

                        {booking.collisionDamageWaiver && (
                          <div className="extra">
                            <CheckIcon className="extra-icon" />
                            <span className="extra-title">{csStrings.COLLISION_DAMAGE_WAVER}</span>
                            <span className="extra-text">{Helper.getCollisionDamageWaiverOption(_bookingCar.collisionDamageWaiver, days, _fr)}</span>
                          </div>
                        )}

                        {booking.theftProtection && (
                          <div className="extra">
                            <CheckIcon className="extra-icon" />
                            <span className="extra-title">{csStrings.THEFT_PROTECTION}</span>
                            <span className="extra-text">{Helper.getTheftProtectionOption(_bookingCar.theftProtection, days, _fr)}</span>
                          </div>
                        )}

                        {booking.fullInsurance && (
                          <div className="extra">
                            <CheckIcon className="extra-icon" />
                            <span className="extra-title">{csStrings.FULL_INSURANCE}</span>
                            <span className="extra-text">{Helper.getFullInsuranceOption(_bookingCar.fullInsurance, days, _fr)}</span>
                          </div>
                        )}

                        {booking.additionalDriver && (
                          <div className="extra">
                            <CheckIcon className="extra-icon" />
                            <span className="extra-title">{csStrings.ADDITIONAL_DRIVER}</span>
                            <span className="extra-text">{Helper.getAdditionalDriverOption(_bookingCar.additionalDriver, days)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <span className="booking-detail-title">{strings.COST}</span>
                    <div className="booking-detail-value booking-price">{`${bookcarsHelper.formatNumber(booking.price)} ${commonStrings.CURRENCY}`}</div>
                  </div>

                  <div className="bs-buttons">
                    {booking.cancellation
                      && !booking.cancelRequest
                      && booking.status !== bookcarsTypes.BookingStatus.Cancelled
                      && new Date(booking.from) > new Date() && (
                        <Button
                          variant="contained"
                          className="btn-secondary"
                          onClick={() => {
                            setSelectedId(booking._id as string)
                            setOpenCancelDialog(true)
                          }}
                        >
                          {strings.CANCEL}
                        </Button>
                      )}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <DataGrid
            className="data-grid"
            checkboxSelection={checkboxSelection}
            getRowId={(row: bookcarsTypes.Booking): GridRowId => row._id as GridRowId}
            columns={columns}
            rows={rows}
            rowCount={rowCount}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: { pageSize: Env.BOOKINGS_PAGE_SIZE },
              },
            }}
            pageSizeOptions={[Env.BOOKINGS_PAGE_SIZE, 50, 100]}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            localeText={(user.language === 'fr' ? frFR : enUS).components.MuiDataGrid.defaultProps.localeText}
            // slots={{
            //   noRowsOverlay: () => '',
            // }}
            disableRowSelectionOnClick
          />
        ))}

      <Dialog disableEscapeKeyDown maxWidth="xs" open={openCancelDialog}>
        <DialogTitle className="dialog-header">{!cancelRequestSent && !cancelRequestProcessing && commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent className="dialog-content">
          {cancelRequestProcessing ? (
            <Stack sx={{ color: '#f37022' }}>
              <CircularProgress color="inherit" />
            </Stack>
          ) : cancelRequestSent ? (
            strings.CANCEL_BOOKING_REQUEST_SENT
          ) : (
            strings.CANCEL_BOOKING
          )}
        </DialogContent>
        <DialogActions className="dialog-actions">
          {!cancelRequestProcessing && (
            <Button onClick={handleCloseCancelBooking} variant="contained" className="btn-secondary">
              {commonStrings.CLOSE}
            </Button>
          )}
          {!cancelRequestSent && !cancelRequestProcessing && (
            <Button onClick={handleConfirmCancelBooking} variant="contained" className="btn-primary">
              {commonStrings.CONFIRM}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default BookingList
