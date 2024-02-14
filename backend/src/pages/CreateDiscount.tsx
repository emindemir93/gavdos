import React, { useState } from 'react'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  FormControlLabel,
  Switch
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import * as bookcarsTypes from 'bookcars-types'
import Master from '../components/Master'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/create-company'
import Backdrop from '../components/SimpleBackdrop'
import * as Helper from '../common/Helper'
import * as CarService from '../services/CarService'

import '../assets/css/create-company.css'

function CreateCompany() {
  const navigate = useNavigate()
  const [minDay, setMinDay] = useState('')
  const [maxDay, setMaxDay] = useState('')
  const [factor, setFactor] = useState('')

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMinDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinDay(e.target.value)
  }
  const handleMaxDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxDay(e.target.value)
  }
   const handleFactor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFactor(e.target.value)
  }

  const onLoad = (user?: bookcarsTypes.User) => {
    if (user && user.verified) {
      setVisible(true)
    }
  }
  const handleCancel = async () => {
    try {
        setLoading(true)

        navigate('/discount')
      } catch {
      navigate('/discount')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()
      const data = {
       minDay: Number(minDay),
       maxDay: Number(maxDay),
       factor: parseFloat(factor).toFixed(2),
       isActive: true
      }

      const discount = await CarService.createDiscount(data)

      if (discount && discount._id) {
        navigate('/discount')
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  return (
    <Master onLoad={onLoad} strict admin>
      <div className="create-company">
        <Paper className="company-form company-form-wrapper" elevation={10} style={visible ? {} : { display: 'none' }}>
          <h1 className="company-form-title">
            {' '}
            {strings.CREATE_DISCOUNT_HEADING}
            {' '}
          </h1>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{commonStrings.MIN_DAY}</InputLabel>
              <Input
                id="min-day"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '^\\d+(.\\d+)?$',
                }}
                required
                onChange={handleMinDay}
                autoComplete="off"
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{commonStrings.MAX_DAY}</InputLabel>
              <Input
                id="max-day"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '^\\d+(.\\d+)?$',
                }}
                required
                onChange={handleMaxDay}
                autoComplete="off"
              />
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{commonStrings.RATIO}</InputLabel>
              <Input
                id="ratio"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '^\\d+(.\\d+)?$',
                }}
                required
                onChange={handleFactor}
                autoComplete="off"
              />
            </FormControl>

            <div className="buttons">
              <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                {commonStrings.CREATE}
              </Button>
              <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" onClick={handleCancel}>
                {commonStrings.CANCEL}
              </Button>
            </div>
          </form>
        </Paper>
      </div>
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </Master>
  )
}

export default CreateCompany
