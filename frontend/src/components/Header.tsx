import React, { useState, useEffect, CSSProperties } from 'react'
import { toast } from 'react-toastify'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  MenuItem,
  Menu,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Box,
  Link
} from '@mui/material'
import {
  Menu as MenuIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  More as MoreIcon,
  Language as LanguageIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  InfoTwoTone as AboutIcon,
  DescriptionTwoTone as TosIcon,
  ExitToApp as SignoutIcon,
  Login as LoginIcon,
  EventSeat as BookingsIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import * as bookcarsTypes from 'bookcars-types'
import Env from '../config/env.config'
import { strings } from '../lang/header'
import { strings as commonStrings } from '../lang/common'
import * as UserService from '../services/UserService'
import * as NotificationService from '../services/NotificationService'
import Avatar from './Avatar'
import * as LangHelper from '../common/LangHelper'
import * as Helper from '../common/Helper'
import '../assets/css/header.css'

interface HeaderProps {
  user?: bookcarsTypes.User
  hidden?: boolean
  hideSignin?: boolean
  notificationCount?: number
}

function ListItemLink(props: any) {
  return <ListItemButton component="a" {...props} />
}

function Header({
  user,
  hidden,
  hideSignin,
  notificationCount: headerNotificationCount
}: HeaderProps) {
  const navigate = useNavigate()
  const [lang, setLang] = useState(Helper.getLanguage(Env.DEFAULT_LANGUAGE))
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [langAnchorEl, setLangAnchorEl] = useState<HTMLElement | null>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<HTMLElement | null>(null)
  const [sideAnchorEl, setSideAnchorEl] = useState<HTMLElement | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)
  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)
  const isLangMenuOpen = Boolean(langAnchorEl)
  const isSideMenuOpen = Boolean(sideAnchorEl)

  const classes = {
    list: {
      width: 250,
    },
    formControl: {
      margin: 1,
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: 2,
    },
    grow: {
      flexGrow: 3,
    },
    menuButton: {
      marginRight: 2,
    },
    navlinks: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      flex: 'inherit',
      width: 50
    },
    tabTextCss: {
      fontWeight: '700',
      fontSize: 'large'
    }
  }
  const classesStyle : { navlinks: CSSProperties } = {
    navlinks: {
      display: 'grid',
      gridTemplateColumns: 'auto auto auto auto auto',
      gridGap: '20px',
      width: '75%',
    },

  }

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget)
  }

  const refreshPage = () => {
    const params = new URLSearchParams(window.location.search)

    if (params.has('l')) {
      params.delete('l')
      window.location.href = window.location.href.split('?')[0] + ([...params].length > 0 ? `?${params}` : '')
    } else {
      window.location.reload()
    }
  }

  const handleLangMenuClose = async (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(null)

    const { code } = event.currentTarget.dataset
    if (code) {
      setLang(Helper.getLanguage(code))
      const currentLang = UserService.getLanguage()
      if (isSignedIn && user) {
        // Update user language
        const data: bookcarsTypes.UpdateLanguagePayload = {
          id: user._id as string,
          language: code,
        }
        const status = await UserService.updateLanguage(data)
        if (status === 200) {
          UserService.setLanguage(code)
          if (code && code !== currentLang) {
            // Refresh page
            refreshPage()
          }
        } else {
          toast(commonStrings.CHANGE_LANGUAGE_ERROR, { type: 'error' })
        }
      } else {
        UserService.setLanguage(code)
        if (code && code !== currentLang) {
          // Refresh page
          refreshPage()
        }
      }
    }
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    handleMobileMenuClose()
  }

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  const handleSignout = async () => {
    await UserService.signout()
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const handleSideMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSideAnchorEl(event.currentTarget)
  }

  const handleSideMenuClose = () => {
    setSideAnchorEl(null)
  }

  const handleNotificationsClick = () => {
    navigate('/notifications')
  }

  useEffect(() => {
    const language = LangHelper.getLanguage()
    setLang(Helper.getLanguage(language))
    LangHelper.setLanguage(strings, language)
  }, [])

  useEffect(() => {
    if (!hidden) {
      if (user) {
        NotificationService.getNotificationCounter(user._id as string).then((notificationCounter) => {
          setIsSignedIn(true)
          setNotificationCount(notificationCounter.count)
          setIsLoading(false)
          setIsLoaded(true)
        })
      } else {
        setIsLoading(false)
        setIsLoaded(true)
      }
    }
  }, [hidden, user])
  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }
  const pages = ['HOME', 'BOOKINGS', 'ABOUT', 'TOS', 'CONTACT']
  useEffect(() => {
    if (!hidden) {
      if (headerNotificationCount) {
        setNotificationCount(headerNotificationCount)
      } else {
        setNotificationCount(0)
      }
    }
  }, [hidden, headerNotificationCount])

  const [value, setValue] = React.useState('d')

  const handleChange = (event: React.MouseEvent<HTMLElement>) => {
    setValue(event.currentTarget.id)
  }
  const menuId = 'primary-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleSettingsClick}>
        <SettingsIcon className="header-action" />
        {strings.SETTINGS}
      </MenuItem>
      <MenuItem onClick={handleSignout}>
        <SignoutIcon className="header-action" />
        <Typography>{strings.SIGN_OUT}</Typography>
      </MenuItem>
    </Menu>
  )

  const mobileMenuId = 'mobile-menu'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleSettingsClick}>
        <SettingsIcon className="header-action" />
        <p>{strings.SETTINGS}</p>
      </MenuItem>
      <MenuItem onClick={handleLangMenuOpen}>
        <IconButton aria-label="language of current user" aria-controls="primary-search-account-menu" aria-haspopup="true" color="inherit">
          <LanguageIcon />
        </IconButton>
        <p>{strings.LANGUAGE}</p>
      </MenuItem>
      <MenuItem onClick={handleSignout}>
        <IconButton color="inherit">
          <SignoutIcon />
        </IconButton>
        <Typography>{strings.SIGN_OUT}</Typography>
      </MenuItem>
    </Menu>
  )

  const languageMenuId = 'language-menu'
  const renderLanguageMenu = (
    <Menu
      anchorEl={langAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={languageMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isLangMenuOpen}
      onClose={handleLangMenuClose}
    >
      {
        Env._LANGUAGES.map((language) => (
          <MenuItem onClick={handleLangMenuClose} data-code={language.code} key={language.code}>
            {language.label}
          </MenuItem>
        ))
      }
    </Menu>
  )

  return (
    (!hidden && (
      <div style={classes.grow} className="header">
        <AppBar position="fixed" sx={{ bgcolor: '#f37022' }}>
          <Toolbar className="toolbar" style={classes.grow}>
            {/* <Box sx={{ flexGrow: 3, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={handleCloseNavMenu}
                  sx={{ color: 'white', display: 'block' }}
                >
                  {page}
                </Button>
              ))}
            </Box> */}
            {/* old bar */}
            <div style={classesStyle.navlinks}>
              <Button href="/" sx={{ color: 'white', display: 'block' }} onClick={handleChange}>
                <Typography textAlign="center">{strings.HOME}</Typography>
              </Button>
              {isSignedIn && (
              <Button href="/bookings" sx={{ color: 'white', display: 'block' }} onClick={handleChange}>
                <Typography textAlign="center">{strings.BOOKINGS}</Typography>
              </Button>
              )}
              <Button href="/about" sx={{ color: 'white', display: 'block' }} onClick={handleChange}>
                <Typography textAlign="center">{strings.ABOUT}</Typography>
              </Button>
              <Button href="/tos" sx={{ color: 'white', display: 'block' }} onClick={handleChange}>
                <Typography textAlign="center">{strings.TOS}</Typography>
              </Button>
              <Button href="/contact" sx={{ color: 'white', display: 'block' }} onClick={handleChange}>
                <Typography textAlign="center">{strings.CONTACT}</Typography>
              </Button>
            </div>
            <div style={classes.grow} />
            <div className="header-desktop">
              {isSignedIn && (
                <IconButton aria-label="" color="inherit" onClick={handleNotificationsClick}>
                  <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="primary">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}
              {!hideSignin && !isSignedIn && isLoaded && !loading && (
                <Button variant="contained" startIcon={<LoginIcon />} href="/sign-in" disableElevation fullWidth className="btn-primary" style={{ minWidth: '180px' }}>
                  {strings.SIGN_IN}
                </Button>
              )}
              {isLoaded && !loading && (
                <Button variant="contained" startIcon={<LanguageIcon />} onClick={handleLangMenuOpen} disableElevation fullWidth className="btn-primary">
                  {lang?.label}
                </Button>
              )}
              {isSignedIn && (
                <IconButton edge="end" aria-label="account" aria-controls={menuId} aria-haspopup="true" onClick={handleAccountMenuOpen} color="inherit">
                  <Avatar loggedUser={user} user={user} size="small" readonly />
                </IconButton>
              )}
            </div>
            <div className="header-mobile">
              {!isSignedIn && !loading && (
                <Button variant="contained" startIcon={<LanguageIcon />} onClick={handleLangMenuOpen} disableElevation fullWidth className="btn-primary">
                  {lang?.label}
                </Button>
              )}
              {isSignedIn && (
                <IconButton color="inherit" onClick={handleNotificationsClick}>
                  <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="secondary">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}
              {isSignedIn && (
                <IconButton aria-label="show more" aria-controls={mobileMenuId} aria-haspopup="true" onClick={handleMobileMenuOpen} color="inherit">
                  <MoreIcon />
                </IconButton>
              )}
            </div>
          </Toolbar>
        </AppBar>

        {renderMobileMenu}
        {renderMenu}
        {renderLanguageMenu}
      </div>
    )) || <></>
  )
}

export default Header
