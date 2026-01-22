import * as Yup from 'yup';

export const NewProductSchema = Yup.object().shape({
  name: Yup.string().required('Nombre del producto es requerido'),
  // 🆕 STAGED UPLOADS: images ahora es opcional, se valida upload_ids en el componente
  images: Yup.array().optional(),
  description: Yup.string().optional(),
  productsPdvs: Yup.array().min(1, 'El punto de venta es requerido').required('El punto de venta es requerido'),

  barCode: Yup.string().required('Código de barras es requerido'),
  sku: Yup.string().optional(),
  priceBase: Yup.string().required('El precio debe ser mayor a $0.00'),
  priceSale: Yup.string().required('El precio debe ser mayor a $0.00'),
  quantityStock: Yup.number(),

  category: Yup.mixed()
    .required('La categoria es requerida')
    .test('is-object', 'La categoria es requerida', (value) => value && typeof value === 'object' && 'id' in value),
  brand: Yup.mixed()
    .required('La marca es requerida')
    .test('is-object', 'La marca es requerida', (value) => value && typeof value === 'object' && 'id' in value),

  typeProduct: Yup.number(),
  state: Yup.boolean().required(),
  sellInNegative: Yup.boolean().required(),

  // not required
  taxesOption: Yup.number()

  // productsPvs de tipo PDVproduct
});
