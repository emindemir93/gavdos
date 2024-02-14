import LocalizedStrings from 'react-localization'
import * as LangHelper from '../common/LangHelper'

const strings = new LocalizedStrings({
  fr: {
    EMPTY_LIST: 'Pas de fournisseurs.',
    VIEW_COMPANY: 'Voir le profil de ce fournisseur',
    DELETE_COMPANY: 'Êtes-vous sûr de vouloir supprimer ce fournisseur et toutes ses données ?',
  },
  en: {
    EMPTY_LIST: 'No suppliers.',
    EMPTY_DISCOUNT_LIST: 'No Discounts',
    VIEW_COMPANY: 'View supplier profile',
    DELETE_COMPANY: 'Are you sure you want to delete this supplier and all its data?',
    DELETE_DISCOUNT: 'Are you sure you want to delete this discount and all its data?',
  },
})

LangHelper.setLanguage(strings)
export { strings }
