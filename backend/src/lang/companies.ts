import LocalizedStrings from 'react-localization'
import * as LangHelper from '../common/LangHelper'

const strings = new LocalizedStrings({
  fr: {
    NEW_COMPANY: 'Nouveau fournisseur',
    COMPANY: 'fournisseur',
    COMPANIES: 'fournisseurs',
  },
  en: {
    NEW_COMPANY: 'New supplier',
    NEW_DISCOUNT: 'New Discount',

    COMPANY: 'supplier',
    DISCOUNT: 'discount',
    COMPANIES: 'suppliers',
    DISCOUNTS: 'discounts',

  },
})

LangHelper.setLanguage(strings)
export { strings }
