import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import * as bookcarsTypes from '../miscellaneous/bookcarsTypes'
import * as bookcarsHelper from '../miscellaneous/bookcarsHelper'

import i18n from '../lang/i18n'
import Accordion from './Accordion'
import Link from './Link'
import Switch from './Switch'

interface GearboxFilterProps {
  visible?: boolean
  style?: object
  onChange?: (values: bookcarsTypes.GearboxType[]) => void
}

function GearboxFilter({
  visible,
  style,
  onChange
}: GearboxFilterProps) {
  const [automatic, setAutomatic] = useState(true)
  const [manual, setManual] = useState(true)
  const [values, setValues] = useState([bookcarsTypes.GearboxType.Automatic, bookcarsTypes.GearboxType.Manual])
  const [allChecked, setAllChecked] = useState(true)

  const onValueChangeAutomatic = (checked: boolean) => {
    if (checked) {
      values.push(bookcarsTypes.GearboxType.Automatic)

      if (values.length === 2) {
        setAllChecked(true)
      }
    } else {
      values.splice(
        values.findIndex((v) => v === bookcarsTypes.GearboxType.Automatic),
        1,
      )

      if (values.length === 0) {
        setAllChecked(false)
      }
    }

    setAutomatic(checked)
    setValues(values)
    if (onChange) {
      onChange(bookcarsHelper.clone(values))
    }
  }

  const onValueChangeManual = (checked: boolean) => {
    if (checked) {
      values.push(bookcarsTypes.GearboxType.Manual)

      if (values.length === 2) {
        setAllChecked(true)
      }
    } else {
      values.splice(
        values.findIndex((v) => v === bookcarsTypes.GearboxType.Manual),
        1,
      )

      if (values.length === 0) {
        setAllChecked(false)
      }
    }

    setManual(checked)
    setValues(values)
    if (onChange) {
      onChange(bookcarsHelper.clone(values))
    }
  }

  return (
    visible && (
      <View style={{ ...styles.container, ...style }}>
        <Accordion style={styles.accordion} title={i18n.t('GEARBOX')}>
          <View style={styles.contentContainer}>
            <Switch style={styles.component} textStyle={styles.text} value={automatic} label={i18n.t('GEARBOX_AUTOMATIC')} onValueChange={onValueChangeAutomatic} />
            <Switch style={styles.component} textStyle={styles.text} value={manual} label={i18n.t('GEARBOX_MANUAL')} onValueChange={onValueChangeManual} />
          </View>
          <Link
            style={styles.link}
            textStyle={styles.linkText}
            label={allChecked ? i18n.t('UNCHECK_ALL') : i18n.t('CHECK_ALL')}
            onPress={() => {
              if (allChecked) {
                setAutomatic(false)
                setManual(false)
                setAllChecked(false)
                setValues([])
              } else {
                const _values = [bookcarsTypes.GearboxType.Automatic, bookcarsTypes.GearboxType.Manual]
                setAutomatic(true)
                setManual(true)
                setAllChecked(true)
                setValues(_values)
                if (onChange) {
                  onChange(bookcarsHelper.clone(_values))
                }
              }
            }}
          />
        </Accordion>
      </View>
    )
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  accordion: {
    width: '100%',
    maxWidth: 480,
  },
  component: {
    marginTop: 0,
  },
  text: {
    fontSize: 12,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    fontSize: 12,
  },
})

export default GearboxFilter
