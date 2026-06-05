import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Contact, CrmActivity, Customer, Opportunity, Quote, QuoteLine } from '../../mock/models'
import {
  contacts as mockContacts,
  crmActivities as mockActivities,
  customers as mockCustomers,
  opportunities as mockOpportunities,
  quoteLines as mockQuoteLines,
  quotes as mockQuotes,
} from '../../mock/data'

function deepCopy<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

export interface CrmDataContextValue {
  customers: Customer[]
  contacts: Contact[]
  activities: CrmActivity[]
  opportunities: Opportunity[]
  quotes: Quote[]
  quoteLines: QuoteLine[]
  updateCustomer: (customer: Customer) => void
}

export const CrmDataContext = createContext<CrmDataContextValue | null>(null)

export function useCrmData() {
  const ctx = useContext(CrmDataContext)
  if (!ctx) {
    throw new Error('CrmDataProvider missing')
  }
  return ctx
}

export function CrmDataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => deepCopy(mockCustomers))
  const [contacts] = useState<Contact[]>(() => deepCopy(mockContacts))
  const [activities] = useState<CrmActivity[]>(() => deepCopy(mockActivities))
  const [opportunities] = useState<Opportunity[]>(() => deepCopy(mockOpportunities))
  const [quotes] = useState<Quote[]>(() => deepCopy(mockQuotes))
  const [quoteLines] = useState<QuoteLine[]>(() => deepCopy(mockQuoteLines))

  const updateCustomer = useCallback((customer: Customer) => {
    setCustomers((prev) => {
      const idx = prev.findIndex((x) => x.id === customer.id)
      if (idx < 0) return [customer, ...prev]
      const next = prev.slice()
      next[idx] = customer
      return next
    })
  }, [])

  const value = useMemo<CrmDataContextValue>(
    () => ({
      customers,
      contacts,
      activities,
      opportunities,
      quotes,
      quoteLines,
      updateCustomer,
    }),
    [activities, contacts, customers, opportunities, quoteLines, quotes, updateCustomer],
  )

  return <CrmDataContext.Provider value={value}>{children}</CrmDataContext.Provider>
}
