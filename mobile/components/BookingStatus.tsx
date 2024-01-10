import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import * as bookcarsTypes from '../miscellaneous/bookcarsTypes'

import * as Helper from '../common/Helper'

interface BookingStatusProps {
  style: object
  status: bookcarsTypes.BookingStatus
}

function BookingStatus({
  style,
  status
}: BookingStatusProps) {
  return (
    <View
      style={{
        ...styles.container,
        ...style,
        backgroundColor:
          status === bookcarsTypes.BookingStatus.Void
            ? '#999'
            : status === bookcarsTypes.BookingStatus.Pending
              ? '#e98003'
              : status === bookcarsTypes.BookingStatus.Deposit
                ? '#22bba7'
                : status === bookcarsTypes.BookingStatus.Paid
                  ? '#77bc23'
                  : status === bookcarsTypes.BookingStatus.Reserved
                    ? '#188ace'
                    : status === bookcarsTypes.BookingStatus.Cancelled
                      ? '#bc2143'
                      : 'transparent',
      }}
    >
      <Text style={styles.text}>{Helper.getBookingStatus(status)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '400',
  },
})

export default BookingStatus
