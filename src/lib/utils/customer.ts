// lib/utils/customer.ts

export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
}

export const buildCustomerResponse = (customer: any): CustomerResponse => {
  return {
    id: customer._id.toString(),
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    dob: customer.dob,
    gender: customer.gender,
  };
};
  