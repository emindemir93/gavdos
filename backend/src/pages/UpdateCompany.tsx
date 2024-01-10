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
import { Info as InfoIcon } from '@mui/icons-material'
import validator from 'validator'
import * as bookcarsTypes from 'bookcars-types'
import * as bookcarsHelper from 'bookcars-helper'
import Master from '../components/Master'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as ccStrings } from '../lang/create-company'
import * as SupplierService from '../services/SupplierService'
import * as UserService from '../services/UserService'
import * as Helper from '../common/Helper'
import Error from '../components/Error'
import Backdrop from '../components/SimpleBackdrop'
import NoMatch from './NoMatch'
import Avatar from '../components/Avatar'

import '../assets/css/update-company.css'

function UpdateCompany() {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [company, setCompany] = useState<bookcarsTypes.User>()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fullNameError, setFullNameError] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [avatarError, setAvatarError] = useState(false)
  const [email, setEmail] = useState('')
  const [phoneValid, setPhoneValid] = useState(true)
  const [payLater, setPayLater] = useState(true)

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)

    if (!e.target.value) {
      setFullNameError(false)
    }
  }

  const validateFullName = async (_fullName: string) => {
    if (company && _fullName) {
      if (company.fullName !== _fullName) {
        try {
          const status = await SupplierService.validate({ fullName: _fullName })

          if (status === 200) {
            setFullNameError(false)
            return true
          }
          setFullNameError(true)
          setAvatarError(false)
          setError(false)
          return false
        } catch (err) {
          Helper.error(err)
          return true
        }
      } else {
        setFullNameError(false)
        setAvatarError(false)
        setError(false)
        return true
      }
    } else {
      setFullNameError(true)
      setAvatarError(false)
      setError(false)
      return false
    }
  }

  const handleFullNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await validateFullName(e.target.value)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)

    if (!e.target.value) {
      setPhoneValid(true)
    }
  }

  const validatePhone = (_phone?: string) => {
    if (_phone) {
      const _phoneValid = validator.isMobilePhone(_phone)
      setPhoneValid(_phoneValid)

      return _phoneValid
    }
    setPhoneValid(true)

    return true
  }

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validatePhone(e.target.value)
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value)
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value)
  }

  const onBeforeUpload = () => {
    setLoading(true)
  }

  const onAvatarChange = (_avatar: string) => {
    if (company && user) {
      const _company = bookcarsHelper.clone(company)
      _company.avatar = _avatar

      if (user._id === company._id) {
        const _user = bookcarsHelper.clone(user)
        _user.avatar = _avatar
        setUser(_user)
      }

      setLoading(false)
      setCompany(_company)

      if (_avatar) {
        setAvatarError(false)
      }
    } else {
      Helper.error()
    }
  }

  const handleResendActivationLink = async () => {
    if (company) {
      try {
        const status = await UserService.resend(company.email, false, Env.APP_TYPE)

        if (status === 200) {
          Helper.info(commonStrings.ACTIVATION_EMAIL_SENT)
        } else {
          Helper.error()
        }
      } catch (err) {
        Helper.error(err)
      }
    }
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    if (_user && _user.verified) {
      setLoading(true)
      setUser(_user)

      const params = new URLSearchParams(window.location.search)
      if (params.has('c')) {
        const id = params.get('c')
        if (id && id !== '') {
          try {
            const _company = await SupplierService.getSupplier(id)

            if (_company) {
              setCompany(_company)
              setEmail(_company.email || '')
              setAvatar(_company.avatar || '')
              setFullName(_company.fullName || '')
              setPhone(_company.phone || '')
              setLocation(_company.location || '')
              setBio(_company.bio || '')
              setPayLater(_company.payLater || false)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const fullNameValid = await validateFullName(fullName)
      if (!fullNameValid) {
        return
      }

      const _phoneValid = validatePhone(phone)
      if (!_phoneValid) {
        return
      }

      if (!avatar) {
        setAvatarError(true)
        setError(false)
        return
      }

      if (!company) {
        Helper.error()
        return
      }

      const data: bookcarsTypes.UpdateSupplierPayload = {
        _id: company._id as string,
        fullName,
        phone,
        location,
        bio,
        payLater,
      }

      const status = await SupplierService.update(data)

      if (status === 200) {
        company.fullName = fullName
        setCompany(bookcarsHelper.clone(company))
        Helper.info(commonStrings.UPDATED)
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const admin = Helper.admin(user)

  return (
    <Master onLoad={onLoad} strict user={user}>
      {visible && (
        <div className="update-company">
          <Paper className="company-form-update company-form-wrapper" elevation={10}>
            <form onSubmit={handleSubmit}>
              <Avatar
                type={bookcarsTypes.RecordType.Company}
                mode="update"
                record={company}
                size="large"
                readonly={false}
                hideDelete
                onBeforeUpload={onBeforeUpload}
                onChange={onAvatarChange}
                color="disabled"
                className="avatar-ctn"
              />

              <div className="info">
                <InfoIcon />
                <span>{ccStrings.RECOMMENDED_IMAGE_SIZE}</span>
              </div>

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                <Input id="full-name" type="text" error={fullNameError} required onBlur={handleFullNameBlur} onChange={handleFullNameChange} autoComplete="off" value={fullName} />
                <FormHelperText error={fullNameError}>{(fullNameError && ccStrings.INVALID_COMPANY_NAME) || ''}</FormHelperText>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                <Input id="email" type="text" value={email} disabled />
              </FormControl>

              <FormControl component="fieldset" style={{ marginTop: 15 }}>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={payLater}
                      onChange={(e) => {
                        setPayLater(e.target.checked)
                      }}
                      color="primary"
                    />
                  )}
                  label={commonStrings.PAY_LATER}
                />
              </FormControl>

              <div className="info">
                <InfoIcon />
                <span>{commonStrings.OPTIONAL}</span>
              </div>

              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.PHONE}</InputLabel>
                <Input id="phone" type="text" onChange={handlePhoneChange} onBlur={handlePhoneBlur} autoComplete="off" value={phone} error={!phoneValid} />
                <FormHelperText error={!phoneValid}>{(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}</FormHelperText>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.LOCATION}</InputLabel>
                <Input id="location" type="text" onChange={handleLocationChange} autoComplete="off" value={location} />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.BIO}</InputLabel>
                <Input id="bio" type="text" onChange={handleBioChange} autoComplete="off" value={bio} />
              </FormControl>
              {admin && (
                <FormControl fullWidth margin="dense" className="resend-activation-link">
                  <Button
                    variant="outlined"
                    onClick={handleResendActivationLink}
                  >
                    {commonStrings.RESEND_ACTIVATION_LINK}
                  </Button>
                </FormControl>
              )}
              <div className="buttons">
                <Button type="submit" variant="contained" className="btn-primary btn-margin btn-margin-bottom" size="small" href={`/change-password?u=${company && company._id}`}>
                  {commonStrings.RESET_PASSWORD}
                </Button>
                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.SAVE}
                </Button>
                <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" href="/suppliers">
                  {commonStrings.CANCEL}
                </Button>
              </div>

              <div className="form-error">
                {error && <Error message={commonStrings.GENERIC_ERROR} />}
                {avatarError && <Error message={commonStrings.IMAGE_REQUIRED} />}
              </div>
            </form>
          </Paper>
        </div>
      )}
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      {noMatch && <NoMatch hideHeader />}
    </Master>
  )
}

export default UpdateCompany
