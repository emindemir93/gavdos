import LocalizedStrings from 'react-localization'
import Env from '../config/env.config'
import * as LangHelper from '../common/LangHelper'

const strings = new LocalizedStrings({
  fr: {
    NEW_CAR_HEADING: 'Nouvelle voiture',
    NAME: 'Nom',
    CAR_IMAGE_SIZE_ERROR: `L'image doit être au format ${Env.CAR_IMAGE_WIDTH}x${Env.CAR_IMAGE_HEIGHT}`,
    RECOMMENDED_IMAGE_SIZE: `Taille d'image recommandée : ${Env.CAR_IMAGE_WIDTH}x${Env.CAR_IMAGE_HEIGHT}`,
    COMPANY: 'Fournisseur',
    LOCATIONS: 'Lieux de prise en charge',
    AVAILABLE: 'Disponible à la location',
    CAR_TYPE: 'Moteur',
    PRICE: 'Prix',
    SEATS: 'Sièges',
    DOORS: 'Portes',
    GEARBOX: 'Transmission',
    AIRCON: 'Climatisation',
    MINIMUM_AGE: 'Âge minimum',
    MINIMUM_AGE_NOT_VALID: `L'âge minimum doit être supérieur ou égal à ${Env.MINIMUM_AGE} ans.`,
  },
  en: {
    NEW_CAR_HEADING: 'New car',
    NAME: 'Name',
    CAR_IMAGE_SIZE_ERROR: `The image must be in the format ${Env.CAR_IMAGE_WIDTH}x${Env.CAR_IMAGE_HEIGHT}`,
    RECOMMENDED_IMAGE_SIZE: `Recommended image size: ${Env.CAR_IMAGE_WIDTH}x${Env.CAR_IMAGE_HEIGHT}`,
    COMPANY: 'Supplier',
    LOCATIONS: 'Pickup locations',
    AVAILABLE: 'Available for rental',
    AVAILABLE_FOR_DISCOUNT: 'Available for discount',
    CAR_TYPE: 'Engine',
    PRICE: 'Price',
    PER_EXTRA_KM: 'Per Extra Km',
    DROP_OFF_FEE: 'Drop Off Fee',
    DRIVER_SERVICE: 'Driver Service',
    SEATS: 'Seats',
    DOORS: 'Doors',
    GEARBOX: 'Gearbox',
    AIRCON: 'Aircon',
    MINIMUM_AGE: 'Minimum age',
    MINIMUM_AGE_NOT_VALID: `Minimum age must be greater than or equal to ${Env.MINIMUM_AGE} years old.`,
  },
})

LangHelper.setLanguage(strings)
export { strings }
