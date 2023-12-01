import * as Yup from 'yup';

export const NewProductSchema = Yup.object().shape({
  name: Yup.string().required('Nombre del producto es requerido'),
  images: Yup.array().min(1, 'Las imagenes son requeridas').required('Las imagenes son requeridas'),
  description: Yup.string().optional(),
  productsPdvs: Yup.array().min(1, 'El punto de venta es requerido').required('El punto de venta es requerido'),

  barCode: Yup.string().required('Código de barras es requerido'),
  sku: Yup.string().optional(),
  priceBase: Yup.string().required('El precio debe ser mayo a $0.00'),
  priceSale: Yup.string().required('El precio debe ser mayo a $0.00'),
  quantityStock: Yup.number(),

  category: Yup.string().required('La categoria es requerida'),
  brand: Yup.string().required('La marca es requerida'),

  typeProduct: Yup.number(),
  state: Yup.boolean().required(),
  sellInNegative: Yup.boolean().required(),

  // not required
  taxesOption: Yup.number()

  // productsPvs de tipo PDVproduct
});
