import React, { useState } from 'react'
import { Button } from '@mui/material'
import * as bookcarsTypes from 'bookcars-types'
import Master from '../components/Master'
import { strings } from '../lang/companies'
import DiscountList from '../components/DiscountList'
import InfoBox from '../components/InfoBox'
import * as Helper from '../common/Helper'

import '../assets/css/companies.css'

function Discount() {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [rowCount, setRowCount] = useState(-1)

  const handleDiscountListLoad: bookcarsTypes.DataEvent<bookcarsTypes.Discount> = (data) => {
    if (data) {
      setRowCount(data.rowCount)
    }
  }

  const handleDiscountDelete = (_rowCount: number) => {
    setRowCount(_rowCount)
  }

  const onLoad = (_user?: bookcarsTypes.User) => {
    setUser(_user)
  }

  const admin = Helper.admin(user)

  return (
    <Master onLoad={onLoad} strict>
      {user && (
        <div className="companies">
          <div className="col-1">
            <div className="col-1-container">
              {rowCount > -1 && admin && (
                <Button
                  type="submit"
                  variant="contained"
                  className="btn-primary new-company"
                  size="small"
                  href="/createDiscount"
                >
                  {strings.NEW_DISCOUNT}
                </Button>
              )}

              {rowCount > 0 && (
              <InfoBox
                value={`${rowCount} ${rowCount > 1 ? strings.DISCOUNTS : strings.DISCOUNT}`}
                className="company-count"
              />
)}
            </div>
          </div>
          <div className="col-2">
            <DiscountList
              user={user}
              onLoad={handleDiscountListLoad}
              onDelete={handleDiscountDelete}
            />
          </div>
        </div>
      )}
    </Master>
  )
}

export default Discount
