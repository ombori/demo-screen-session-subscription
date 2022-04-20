/**
 * @title Example schema
 */
export type Schema = {
  /**
   * @title Product name
   * @default "My Example Product"
   */
  productName: string;

  /**
   * @title Product price
   * @default "99 USD"
   */
  productPrice: string;

  /**
   * @title Mobile endpoint picker
   * @ui mobileEndpointPicker
   */
  mobileEndpoint: any; // TODO: will share the actual type soon
}