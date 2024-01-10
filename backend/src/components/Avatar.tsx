import React, { useState, useEffect } from 'react'
import {
  Button,
  Avatar as MaterialAvatar,
  Badge,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material'
import {
  AccountCircle,
  PhotoCamera as PhotoCameraIcon,
  BrokenImageTwoTone as DeleteIcon,
  CorporateFare as CompanyIcon,
  DirectionsCar as CarIcon,
  Check as VerifiedIcon,
} from '@mui/icons-material'
import * as bookcarsTypes from 'bookcars-types'
import * as bookcarsHelper from 'bookcars-helper'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import * as Helper from '../common/Helper'
import * as UserService from '../services/UserService'
import * as CarService from '../services/CarService'

interface AvatarProps {
  width?: number,
  height?: number,
  mode?: 'create' | 'update',
  type?: string,
  record?: bookcarsTypes.User | bookcarsTypes.Car | null,
  size: 'small' | 'medium' | 'large',
  readonly?: boolean,
  color?: 'disabled' | 'action' | 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning',
  className?: string,
  verified?: boolean,
  hideDelete?: boolean,
  onValidate?: (valid: boolean) => void,
  onBeforeUpload?: () => void,
  onChange?: (param: string) => void,
}

function Avatar({
  width,
  height,
  mode,
  type,
  record,
  size,
  readonly,
  color,
  className,
  verified,
  hideDelete,
  onValidate,
  onBeforeUpload,
  onChange,
}: AvatarProps) {
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const [openTypeDialog, setOpenTypeDialog] = useState(false)
  const [avatarRecord, setAvatarRecord] = useState<bookcarsTypes.User | bookcarsTypes.Car>()
  const [avatar, setAvatar] = useState<string | undefined | null>(null)
  const [loading, setIsLoading] = useState(true)

  const validate = async (file: Blob, onValid: () => void) => {
    if (width && height) {
      const _URL = window.URL || window.webkitURL
      const img = new Image()
      const objectUrl = _URL.createObjectURL(file)
      img.onload = async () => {
        if (width !== img.width || height !== img.height) {
          if (onValidate) {
            onValidate(false)
          }
        } else {
          if (onValidate) {
            onValidate(true)
          }
          if (onValid) {
            await onValid()
          }
        }
        _URL.revokeObjectURL(objectUrl)
      }
      img.src = objectUrl
    } else if (onValid) {
      onValid()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      Helper.error()
      return
    }

    if (onBeforeUpload) {
      onBeforeUpload()
    }

    const reader = new FileReader()
    const file = e.target.files[0]

    reader.onloadend = async () => {
      if (type === bookcarsTypes.RecordType.Admin
        || type === bookcarsTypes.RecordType.Company
        || type === bookcarsTypes.RecordType.User) {
        if (mode === 'create') {
          const createAvatar = async () => {
            try {
              const data = await UserService.createAvatar(file)

              setAvatar(data)

              if (onChange) {
                onChange(data)
              }
            } catch (err) {
              Helper.error(err)
            }
          }

          await validate(file, createAvatar)
        } else if (avatarRecord && mode === 'update') {
          const updateAvatar = async () => {
            try {
              const { _id } = avatarRecord

              if (!_id) {
                Helper.error()
                return
              }

              const status = await UserService.updateAvatar(_id, file)

              if (status === 200) {
                const user = await UserService.getUser(_id)

                if (user) {
                  setAvatarRecord(user)
                  setAvatar(user.avatar || '')

                  if (onChange) {
                    onChange(user.avatar || '')
                  }
                } else {
                  Helper.error()
                }
              } else {
                Helper.error()
              }
            } catch (err) {
              Helper.error(err)
            }
          }

          await validate(file, updateAvatar)
        }
      } else if (type === bookcarsTypes.RecordType.Car) {
        if (mode === 'create') {
          const createAvatar = async () => {
            try {
              const data = await CarService.createImage(file)
              setAvatar(data)

              if (onChange) {
                onChange(data)
              }
            } catch (err) {
              Helper.error(err)
            }
          }

          await validate(file, createAvatar)
        } else if (mode === 'update') {
          const updateAvatar = async () => {
            try {
              if (!avatarRecord) {
                Helper.error()
                return
              }

              const { _id } = avatarRecord

              if (!_id) {
                Helper.error()
                return
              }

              const status = await CarService.updateImage(_id, file)

              if (status === 200) {
                const car = await CarService.getCar(_id)

                if (car) {
                  setAvatarRecord(car)
                  setAvatar(car.image || '')

                  if (onChange) {
                    onChange(car.image || '')
                  }
                } else {
                  Helper.error()
                }
              } else {
                Helper.error()
              }
            } catch (err) {
              Helper.error(err)
            }
          }

          await validate(file, updateAvatar)
        }
      }
    }

    reader.readAsDataURL(file)
  }

  const handleUpload = () => {
    if (!type) {
      setOpenTypeDialog(true)
      return
    }
    const upload = document.getElementById('upload') as HTMLInputElement
    upload.value = ''
    setTimeout(() => {
      upload.click()
    }, 0)
  }

  const handleCloseDialog = () => {
    setOpenTypeDialog(false)
  }

  const openDialog = () => {
    setOpen(true)
  }

  const handleDeleteAvatar = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    openDialog()
  }

  const closeDialog = () => {
    setOpen(false)
  }

  const handleCancelDelete = () => {
    closeDialog()
  }

  const handleDelete = async () => {
    try {
      if (type === bookcarsTypes.RecordType.Admin || type === bookcarsTypes.RecordType.Company || type === bookcarsTypes.RecordType.User) {
        if (avatarRecord && mode === 'update') {
          const { _id } = avatarRecord

          if (!_id) {
            Helper.error()
            return
          }

          const status = await UserService.deleteAvatar(_id)

          if (status === 200) {
            const user = await UserService.getUser(_id)

            if (user) {
              setAvatarRecord(user)
              setAvatar(null)

              if (onChange) {
                onChange('')
              }
              closeDialog()
            } else {
              Helper.error()
            }
          } else {
            Helper.error()
          }
        } else if (!avatarRecord && mode === 'create') {
          const status = await UserService.deleteTempAvatar(avatar as string)

          if (status === 200) {
            setAvatar(null)
            if (onChange) {
              onChange('')
            }
            closeDialog()
          } else {
            Helper.error()
          }
        }
      } else if (type === bookcarsTypes.RecordType.Car) {
        if (!avatarRecord && mode === 'create') {
          const status = await CarService.deleteTempImage(avatar as string)

          if (status === 200) {
            setAvatar(null)
            if (onChange) {
              onChange('')
            }
            closeDialog()
          } else {
            Helper.error()
          }
        } else if (avatarRecord && mode === 'update') {
          const { _id } = avatarRecord

          if (!_id) {
            Helper.error()
            return
          }

          const status = await CarService.deleteImage(_id)

          if (status === 200) {
            const car = await UserService.getUser(_id)

            if (car) {
              setAvatarRecord(car)
              setAvatar(null)
              if (onChange) {
                onChange('')
              }
              closeDialog()
            } else {
              Helper.error()
            }
          } else {
            Helper.error()
          }
        }
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const cdn = () => {
    if (type === bookcarsTypes.RecordType.Car) {
      return mode === 'create' ? Env.CDN_TEMP_CARS : Env.CDN_CARS
    }
    return mode === 'create' ? Env.CDN_TEMP_USERS : Env.CDN_USERS
  }

  useEffect(() => {
    const language = UserService.getLanguage()
    commonStrings.setLanguage(language)

    const currentUser = UserService.getCurrentUser()
    if (currentUser) {
      if (record) {
        setAvatarRecord(record)
        if (type === bookcarsTypes.RecordType.Car) {
          setAvatar((record as bookcarsTypes.Car).image)
        } else {
          setAvatar(record.avatar)
        }
        setIsLoading(false)
      } else if (mode === 'create') {
        setIsLoading(false)
      }
    } else {
      setError(true)
      Helper.error()
    }
  }, [record, type, mode])

  const companyImageStyle = { width: Env.COMPANY_IMAGE_WIDTH }

  const carImageStyle = { width: Env.CAR_IMAGE_WIDTH }

  const userAvatar = avatar ? <MaterialAvatar src={bookcarsHelper.joinURL(cdn(), avatar)} className={size ? `avatar-${size}` : 'avatar'} /> : <></>

  const emptyAvatar = <AccountCircle className={size ? `avatar-${size}` : 'avatar'} color={color || 'inherit'} />

  return !error && !loading ? (
    <div className={className}>
      {avatar ? (
        readonly ? (
          type === bookcarsTypes.RecordType.Car ? (
            <img style={carImageStyle} src={bookcarsHelper.joinURL(cdn(), avatar)} alt={avatarRecord && (avatarRecord as bookcarsTypes.Car).name} />
          ) : type === bookcarsTypes.RecordType.Company ? (
            <div className="company-avatar-readonly">
              <img src={bookcarsHelper.joinURL(cdn(), avatar)} alt={avatarRecord && avatarRecord.fullName} />
            </div>
          ) : verified && avatarRecord && avatarRecord.verified ? (
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={(
                <Tooltip title={commonStrings.VERIFIED}>
                  <Box borderRadius="50%" className={size ? `user-avatar-verified-${size}` : 'user-avatar-verified-medium'}>
                    <VerifiedIcon className={size ? `user-avatar-verified-icon-${size}` : 'user-avatar-verified-icon-medium'} />
                  </Box>
                </Tooltip>
              )}
            >
              {userAvatar}
            </Badge>
          ) : (
            userAvatar
          )
        ) : (
          //! readonly
          <Badge
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            badgeContent={
              hideDelete ? (
                <></>
              ) : (
                <Tooltip title={commonStrings.DELETE_IMAGE}>
                  <Box borderRadius="50%" className="avatar-action-box" onClick={handleDeleteAvatar}>
                    <DeleteIcon className="avatar-action-icon" />
                  </Box>
                </Tooltip>
              )
            }
          >
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              className={type === bookcarsTypes.RecordType.Company ? 'company-avatar' : ''}
              badgeContent={(
                <Tooltip title={commonStrings.UPLOAD_IMAGE}>
                  <Box borderRadius="50%" className="avatar-action-box" onClick={handleUpload}>
                    <PhotoCameraIcon className="avatar-action-icon" />
                  </Box>
                </Tooltip>
              )}
            >
              {type === bookcarsTypes.RecordType.Car ? (
                <div className="car-avatar">
                  <img src={bookcarsHelper.joinURL(cdn(), avatar)} alt={avatarRecord && (avatarRecord as bookcarsTypes.Car).name} />
                </div>
              ) : type === bookcarsTypes.RecordType.Company ? (
                <img style={companyImageStyle} src={bookcarsHelper.joinURL(cdn(), avatar)} alt={avatarRecord && avatarRecord.fullName} />
              ) : (
                <MaterialAvatar src={bookcarsHelper.joinURL(cdn(), avatar)} className={size ? `avatar-${size}` : 'avatar'} />
              )}
            </Badge>
          </Badge>
        )
      ) // !avatar
        : readonly ? (
          type === bookcarsTypes.RecordType.Car ? (
            <CarIcon style={carImageStyle} color={color || 'inherit'} />
          ) : type === bookcarsTypes.RecordType.Company ? (
            <CompanyIcon style={companyImageStyle} color={color || 'inherit'} />
          ) : verified && avatarRecord && avatarRecord.verified ? (
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={(
                <Tooltip title={commonStrings.VERIFIED}>
                  <Box borderRadius="50%" className={size ? `user-avatar-verified-${size}` : 'user-avatar-verified-medium'}>
                    <VerifiedIcon className={size ? `user-avatar-verified-icon-${size}` : 'user-avatar-verified-icon-medium'} />
                  </Box>
                </Tooltip>
              )}
            >
              {emptyAvatar}
            </Badge>
          ) : (
            emptyAvatar
          )
        ) : (
          //! readonly
          <Badge
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={(
                <Tooltip title={commonStrings.UPLOAD_IMAGE}>
                  <Box borderRadius="50%" className="avatar-action-box" onClick={handleUpload}>
                    <PhotoCameraIcon className="avatar-action-icon" />
                  </Box>
                </Tooltip>
              )}
            >
              {type === bookcarsTypes.RecordType.Car ? (
                <CarIcon className={size ? `avatar-${size}` : 'avatar'} color={color || 'inherit'} />
              ) : type === bookcarsTypes.RecordType.Company ? (
                <CompanyIcon className={size ? `avatar-${size}` : 'avatar'} color={color || 'inherit'} />
              ) : (
                <AccountCircle className={size ? `avatar-${size}` : 'avatar'} color={color || 'inherit'} />
              )}
            </Badge>
          </Badge>
        )}
      <Dialog disableEscapeKeyDown maxWidth="xs" open={openTypeDialog}>
        <DialogTitle className="dialog-header">{commonStrings.INFO}</DialogTitle>
        <DialogContent>{commonStrings.USER_TYPE_REQUIRED}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseDialog} variant="contained" className="btn-secondary">
            {commonStrings.CLOSE}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog disableEscapeKeyDown maxWidth="xs" open={open}>
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{commonStrings.DELETE_AVATAR_CONFIRM}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCancelDelete} className="btn-secondary">
            {commonStrings.CANCEL}
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {commonStrings.DELETE}
          </Button>
        </DialogActions>
      </Dialog>
      {!readonly && <input id="upload" type="file" hidden onChange={handleChange} />}
    </div>
  ) : null
}

export default Avatar
