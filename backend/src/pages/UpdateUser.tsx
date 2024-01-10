import React, { useState } from 'react'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  SelectChangeEvent
} from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import { intervalToDuration } from 'date-fns'
import validator from 'validator'
import { useNavigate } from 'react-router-dom'
import * as bookcarsTypes from 'bookcars-types'
import * as bookcarsHelper from 'bookcars-helper'
import Master from '../components/Master'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as ccStrings } from '../lang/create-company'
import { strings as cuStrings } from '../lang/create-user'
import { strings } from '../lang/update-user'
import * as Helper from '../common/Helper'
import * as UserService from '../services/UserService'
import * as SupplierService from '../services/SupplierService'
import NoMatch from './NoMatch'
import Error from '../components/Error'
import Backdrop from '../components/SimpleBackdrop'
import Avatar from '../components/Avatar'
import DatePicker from '../components/DatePicker'

import '../assets/css/update-user.css'

function UpdateUser() {
  const navigate = useNavigate()
  const [loggedUser, setLoggedUser] = useState<bookcarsTypes.User>()
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [visible, setVisible] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fullNameError, setFullNameError] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [avatarError, setAvatarError] = useState(false)
  const [type, setType] = useState('')
  const [birthDate, setBirthDate] = useState<Date>()
  const [birthDateValid, setBirthDateValid] = useState(true)
  const [phoneValid, setPhoneValid] = useState(true)
  const [payLater, setPayLater] = useState(true)

  const validateFullName = async (_fullName: string, strict = true) => {
    const __fullName = _fullName || fullName

    if (__fullName && (strict || (!strict && __fullName !== user?.fullName))) {
      try {
        const status = await SupplierService.validate({ fullName: __fullName })

        if (status === 200) {
          setFullNameError(false)
          setError(false)
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
      return true
    }
  }

  const handleUserTypeChange = async (e: SelectChangeEvent<string>) => {
    const _type = e.target.value

    setType(e.target.value)

    if (_type === bookcarsTypes.RecordType.Company) {
      await validateFullName(fullName)
    } else {
      setFullNameError(false)
    }
  }

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)

    if (!e.target.value) {
      setFullNameError(false)
    }
  }

  const handleFullNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (type === bookcarsTypes.RecordType.Company) {
      await validateFullName(e.target.value)
    } else {
      setFullNameError(false)
    }
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

  const validateBirthDate = (date?: Date) => {
    if (date && bookcarsHelper.isDate(date) && type === bookcarsTypes.RecordType.User) {
      const now = new Date()
      const sub = intervalToDuration({ start: date, end: now }).years ?? 0
      const _birthDateValid = sub >= Env.MINIMUM_AGE

      setBirthDateValid(_birthDateValid)
      return _birthDateValid
    }
    setBirthDateValid(true)
    return true
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
    if (loggedUser && user && loggedUser._id === user._id) {
      const _loggedUser = bookcarsHelper.clone(loggedUser)
      _loggedUser.avatar = _avatar

      setLoggedUser(_loggedUser)
    }

    const _user = bookcarsHelper.clone(user)
    _user.avatar = _avatar

    setLoading(false)
    setUser(_user)
    setAvatar(_avatar)

    if (_avatar !== null && type === bookcarsTypes.RecordType.Company) {
      setAvatarError(false)
    }
  }

  const handleCancel = async () => {
    try {
      if (avatar) {
        setLoading(true)

        await UserService.deleteTempAvatar(avatar)
        navigate('/users')
      } else {
        navigate('/users')
      }
    } catch {
      navigate('/users')
    }
  }

  const handleResendActivationLink = async () => {
    try {
      const status = await UserService.resend(email, false, type === bookcarsTypes.RecordType.User ? 'frontend' : 'backend')

      if (status === 200) {
        Helper.info(commonStrings.ACTIVATION_EMAIL_SENT)
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const onLoad = async (_loggedUser?: bookcarsTypes.User) => {
    if (_loggedUser && _loggedUser.verified) {
      setLoading(true)

      const params = new URLSearchParams(window.location.search)
      if (params.has('u')) {
        const id = params.get('u')
        if (id && id !== '') {
          try {
            const _user = await UserService.getUser(id)

            if (_user) {
              setLoggedUser(_loggedUser)
              setUser(_user)
              setAdmin(Helper.admin(_loggedUser))
              setType(_user.type || '')
              setEmail(_user.email || '')
              setAvatar(_user.avatar || '')
              setFullName(_user.fullName || '')
              setPhone(_user.phone || '')
              setLocation(_user.location || '')
              setBio(_user.bio || '')
              setBirthDate(_user && _user.birthDate ? new Date(_user.birthDate) : undefined)
              setPayLater(_user.payLater || false)
              setVisible(true)
              setLoading(false)
            } else {
              setLoading(false)
              setNoMatch(true)
            }
          } catch (err) {
            Helper.error(err)
            setLoading(false)
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

      if (!user) {
        Helper.error()
        return
      }

      if (type === bookcarsTypes.RecordType.Company) {
        const fullNameValid = await validateFullName(fullName, false)

        if (!fullNameValid) {
          return
        }
      } else {
        setFullNameError(false)
      }

      const _phoneValid = validatePhone(phone)
      if (!_phoneValid) {
        return
      }

      const _birthDateValid = validateBirthDate(birthDate)
      if (!_birthDateValid) {
        return
      }

      if (type === bookcarsTypes.RecordType.Company && !avatar) {
        setAvatarError(true)
        setError(false)
        return
      }

      const language = UserService.getLanguage()
      const data: bookcarsTypes.UpdateUserPayload = {
        _id: user._id as string,
        phone,
        location,
        bio,
        fullName,
        language,
        type,
        avatar,
        birthDate,
      }

      if (type === bookcarsTypes.RecordType.Company) {
        data.payLater = payLater
      }

      const status = await UserService.updateUser(data)

      if (status === 200) {
        user.fullName = fullName
        user.type = type
        setUser(user)
        Helper.info(commonStrings.UPDATED)
      } else {
        Helper.error()

        setError(false)
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const company = type === bookcarsTypes.RecordType.Company
  const driver = type === bookcarsTypes.RecordType.User
  const activate = admin
    || (loggedUser && user && loggedUser.type === bookcarsTypes.RecordType.Company && user.type === bookcarsTypes.RecordType.User && user.company as string === loggedUser._id)

  return (
    <Master onLoad={onLoad} user={loggedUser} strict>
      {loggedUser && user && visible && (
        <div className="update-user">
          <Paper className="user-form user-form-wrapper" elevation={10}>
            <h1 className="user-form-title">
              {' '}
              {strings.UPDATE_USER_HEADING}
              {' '}
            </h1>
            <form onSubmit={handleSubmit}>
              <Avatar
                type={type}
                mode="update"
                record={user}
                size="large"
                readonly={false}
                onBeforeUpload={onBeforeUpload}
                onChange={onAvatarChange}
                color="disabled"
                className="avatar-ctn"
                hideDelete={type === bookcarsTypes.RecordType.Company}
              />

              {company && (
                <div className="info">
                  <InfoIcon />
                  <span>{ccStrings.RECOMMENDED_IMAGE_SIZE}</span>
                </div>
              )}

              {admin && (
                <FormControl fullWidth margin="dense" style={{ marginTop: company ? 0 : 39 }}>
                  <InputLabel className="required">{commonStrings.TYPE}</InputLabel>
                  <Select label={commonStrings.TYPE} value={type} onChange={handleUserTypeChange} variant="standard" required fullWidth>
                    <MenuItem value={bookcarsTypes.RecordType.Admin}>{Helper.getUserType(bookcarsTypes.UserType.Admin)}</MenuItem>
                    <MenuItem value={bookcarsTypes.RecordType.Company}>{Helper.getUserType(bookcarsTypes.UserType.Company)}</MenuItem>
                    <MenuItem value={bookcarsTypes.RecordType.User}>{Helper.getUserType(bookcarsTypes.UserType.User)}</MenuItem>
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                <Input id="full-name" type="text" error={fullNameError} required onBlur={handleFullNameBlur} onChange={handleFullNameChange} autoComplete="off" value={fullName} />
                <FormHelperText error={fullNameError}>{(fullNameError && ccStrings.INVALID_COMPANY_NAME) || ''}</FormHelperText>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                <Input id="email" type="text" value={email} disabled />
              </FormControl>

              {driver && (
                <FormControl fullWidth margin="dense">
                  <DatePicker
                    label={cuStrings.BIRTH_DATE}
                    value={birthDate}
                    required
                    onChange={(_birthDate) => {
                      if (_birthDate) {
                        const _birthDateValid = validateBirthDate(_birthDate)

                        setBirthDate(_birthDate)
                        setBirthDateValid(_birthDateValid)
                      }
                    }}
                    language={(user && user.language) || Env.DEFAULT_LANGUAGE}
                  />
                  <FormHelperText error={!birthDateValid}>{(!birthDateValid && commonStrings.BIRTH_DATE_NOT_VALID) || ''}</FormHelperText>
                </FormControl>
              )}

              {company && (
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
              )}

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

              {activate && (
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
                <Button type="submit" variant="contained" className="btn-primary btn-margin btn-margin-bottom" size="small" href={`/change-password?u=${user._id}`}>
                  {commonStrings.RESET_PASSWORD}
                </Button>

                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.SAVE}
                </Button>

                <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" onClick={handleCancel}>
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

export default UpdateUser
