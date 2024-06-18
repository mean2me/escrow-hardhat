const KEY = 'escrow'

export function saveContract(item) {
  const data = JSON.parse(
    localStorage.getItem(KEY) || JSON.stringify({ contracts: [] }),
  )

  data.contracts.push(item)

  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getContracts() {
  const data = JSON.parse(
    localStorage.getItem(KEY) || JSON.stringify({ contracts: [] }),
  )

  return data.contracts
}

export function updateContract(address, approved) {
  const contracts = getContracts()
  contracts.forEach((c) => {
    if (c.address === address) {
      c.approved = approved
    }
  })

  localStorage.setItem(KEY, JSON.stringify({ contracts }))
}
