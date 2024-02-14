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
  Delete as DeleteIcon
} from '@mui/icons-material'
import * as bookcarsTypes from 'bookcars-types'
import Env from '../config/env.config'
import Const from '../config/const'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/company-list'
import * as CarService from '../services/CarService'
import * as Helper from '../common/Helper'

import '../assets/css/company-list.css'

interface DiscountListProps {
  user?: bookcarsTypes.User
  reload?: boolean
  onLoad?: bookcarsTypes.DataEvent<bookcarsTypes.Discount>
  onDelete?: (rowCount: number) => void
}

function DiscountList({
  user,
  reload: discountListReload,
  onDelete,
  onLoad
}: DiscountListProps) {
  const [reload, setReload] = useState(false)
  const [init, setInit] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetch, setFetch] = useState(false)
  const [rows, setRows] = useState<bookcarsTypes.Discount[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [companyId, setCompanyId] = useState('')
  const [companyIndex, setCompanyIndex] = useState(-1)

  const _fetch = async () => {
    try {
      setLoading(true)
      const discounts = await CarService.getDiscounts()
      if (!discounts) {
        Helper.error()
        return
      }
      const _totalRecords = Array.isArray(discounts) && discounts.length > 0 ? discounts.length : 0
      setRows(discounts)
      setTotalRecords(_totalRecords)
      setFetch(_totalRecords > 0)
      if (onLoad) {
        onLoad({ rows: discounts, rowCount: _totalRecords })
      }
    } catch (err) {
      Helper.error(err)
    } finally {
      setLoading(false)
      setInit(false)
    }
  }

  useEffect(() => {
    if (discountListReload && !reload) {
      _fetch()
    }
    setReload(discountListReload || false)
  }, [discountListReload, reload]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    _fetch()
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = (e: React.MouseEvent<HTMLElement>) => {
    const _companyId = e.currentTarget.getAttribute('data-id') as string
    const _companyIndex = Number(e.currentTarget.getAttribute('data-index') as string)

    setOpenDeleteDialog(true)
    setCompanyId(_companyId)
    setCompanyIndex(_companyIndex)
  }

  const handleConfirmDelete = async () => {
    try {
      if (companyId !== '' && companyIndex > -1) {
        setLoading(false)
        setOpenDeleteDialog(false)
        const status = await CarService.deleteDiscount(companyId)

        if (status === 200) {
          _fetch()
          const _rowCount = rowCount - 1
          rows.splice(companyIndex, 1)
          setRows(rows)
          setRowCount(_rowCount)
          setTotalRecords(totalRecords - 1)
          setCompanyId('')
          setCompanyIndex(-1)
          setLoading(false)

          if (onDelete) {
            onDelete(_rowCount)
          }
        } else {
          Helper.error()
          setCompanyId('')
          setCompanyIndex(-1)
          setLoading(false)
        }
      } else {
        Helper.error()
        setOpenDeleteDialog(false)
        setCompanyId('')
        setCompanyIndex(-1)
        setLoading(false)
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false)
    setCompanyId('')
    setCompanyIndex(-1)
  }

  const admin = Helper.admin(user)

  return (
    <>
      <section className="company-list">
        {rows.length === 0
          ? !init
          && !loading
          && (
            <Card variant="outlined" className="empty-list">
              <CardContent>
                <Typography color="textSecondary">{strings.EMPTY_DISCOUNT_LIST}</Typography>
              </CardContent>
            </Card>
          )
          : rows.map((company, index) => {
            const canDelete = admin
            return (
              <article key={company._id}>
                <div className="company-item">
                  <span className="company-item-title">Min Day:</span>
                  <span className="company-item-item">{company.minDay}</span>
                  <span className="company-item-title">Max Day:</span>
                  <span className="company-item-item">{company.maxDay}</span>
                  <span className="company-item-title">Ratio:</span>
                  <span className="company-item-item">{`${company.factor.$numberDecimal} (${'%'})`}</span>
                </div>
                <div className="company-actions">
                  {canDelete && (
                    <Tooltip title={commonStrings.DELETE}>
                      <IconButton data-id={company._id} data-index={index} onClick={handleDelete}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              </article>
            )
          })}
        <Dialog disableEscapeKeyDown maxWidth="xs" open={openDeleteDialog}>
          <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
          <DialogContent>{strings.DELETE_DISCOUNT}</DialogContent>
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
    </>
  )
}

export default DiscountList
