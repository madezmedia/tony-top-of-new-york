' RokuPay.brs
' Roku Pay (Channel Store) integration for TONY app

sub init()
  m.store = invalid
  m.products = []

  ' Product IDs (must match Channel Store catalog)
  m.PRODUCT_EPISODE = "tony.episode.single"
  m.PRODUCT_SEASON = "tony.season.1"
  m.PRODUCT_ALL_ACCESS = "tony.all.access"

  m.top.observeField("productId", "onProductIdChange")
end sub

' Initialize Roku Pay (Channel Store)
sub initStore()
  if m.store <> invalid then return

  ' Create Channel Store interface
  m.store = CreateObject("roChannelStore")
  m.store.setTheme("dark")

  ' Set language
  m.store.setLanguage("en")

  ? "RokuPay: Channel Store initialized"
end sub

' Get product details from Channel Store
sub getProducts()
  initStore()

  ' Product IDs to fetch
  productIds = [
    m.PRODUCT_EPISODE,
    m.PRODUCT_SEASON,
    m.PRODUCT_ALL_ACCESS
  ]

  ' Fetch product catalog
  products = m.store.GetProducts(productIds)

  if products <> invalid then
    m.products = products

    ' Log product details
    for each product in products
      ? "RokuPay: Product - "; product.code; ": "; product.name; " ($"; product.price / 100; ")"
    next
  else
    ? "RokuPay: Failed to fetch products"
  end if
end sub

' Check if user owns a product
function ownsProduct(productId as String) as Boolean
  initStore()

  ' Get user's purchases
  purchases = m.store.GetPurchases()

  if purchases = invalid then return false

  ' Check if product is in purchases
  for each purchase in purchases
    if purchase.code = productId then
      ' Check if not expired
      if purchase.expiration = invalid OR purchase.expiration > CreateObject("roDateTime").AsSeconds() then
        return true
      end if
    end if
  next

  return false
end function

' Initiate a purchase
sub purchaseProduct(productId as String)
  m.top.purchaseInProgress = true
  m.top.purchaseError = ""
  m.top.productId = productId

  initStore()

  ' Get product details
  product = getProductById(productId)

  if product = invalid then
    m.top.purchaseError = "Product not found"
    m.top.purchaseInProgress = false
    return
  end if

  ' Purchase parameters
  purchaseParams = {
    code: productId,
    name: product.name,
    price: product.price,
    quantity: 1
  }

  ' Set up purchase observers
  m.store.observeField("transaction", "onTransactionComplete")
  m.store.observeField("purchaseError", "onPurchaseError")

  ' Execute purchase
  m.store.Order(purchaseParams)

  ? "RokuPay: Purchase initiated for "; productId
end sub

' Handle successful transaction
sub onTransactionComplete()
  transaction = m.store.transaction

  if transaction <> invalid then
    m.top.purchaseCompleted = true
    m.top.purchaseInProgress = false
    m.top.transactionId = transaction.transactionId
    m.top.receipt = transaction

    ? "RokuPay: Purchase successful - "; transaction.transactionId

    ' Grant entitlement to user
    grantEntitlement(transaction)
  else
    m.top.purchaseInProgress = false
    m.top.purchaseError = "Transaction failed"
  end if
end sub

' Handle purchase error
sub onPurchaseError()
  error = m.store.purchaseError

  m.top.purchaseInProgress = false
  m.top.purchaseError = error.message

  ? "RokuPay: Purchase error - "; error.message
end sub

' Get product by ID
function getProductById(productId as String) as Object
  for each product in m.products
    if product.code = productId then
      return product
    end if
  next

  return invalid
end function

' Grant entitlement after successful purchase
sub grantEntitlement(transaction as Object)
  ' Sync with backend server
  userId = m.global.user.id
  productId = m.top.productId
  transactionId = transaction.transactionId

  ' Call backend to record purchase
  url = m.global.appInfo.apiHost + "/api/roku/purchase"

  ' Build purchase payload
  payload = {
    user_id: userId,
    product_id: productId,
    transaction_id: transactionId,
    receipt: transaction
  }

  ' Make API request
  request = CreateObject("roUrlTransfer")
  request.SetUrl(url)
  request.AddHeader("Content-Type", "application/json")
  request.AddHeader("Authorization", "Bearer " + m.global.user.sessionToken)

  response = request.PostToString FormatJson(payload)

  if response <> invalid then
    result = ParseJson(response)
    if result <> invalid AND result.success then
      ? "RokuPay: Entitlement granted on backend"
    else
      ? "RokuPay: Failed to grant entitlement on backend"
    end if
  end if
end sub

' Purchase individual episode
sub purchaseEpisode(episodeId as String)
  productId = m.PRODUCT_EPISODE + "." + episodeId
  purchaseProduct(productId)
end sub

' Purchase full season
sub purchaseSeason(seasonNumber as Integer)
  productId = m.PRODUCT_SEASON + "." + Str(seasonNumber).Trim()
  purchaseProduct(productId)
end sub

' Purchase all access pass
sub purchaseAllAccess()
  purchaseProduct(m.PRODUCT_ALL_ACCESS)
end sub

' Restore previous purchases
sub restorePurchases()
  initStore()

  purchases = m.store.GetPurchases()

  if purchases <> invalid then
    for each purchase in purchases
      ? "RokuPay: Restored purchase - "; purchase.code

      ' Sync each purchase with backend
      grantEntitlement(purchase)
    next
  end if
end sub

' Get purchase history
function getPurchaseHistory() as Object
  initStore()
  return m.store.GetPurchases()
end function

' Check if subscription is active
function isSubscriptionActive() as Boolean
  return ownsProduct(m.PRODUCT_ALL_ACCESS)
end function

' Get formatted price for product
function getProductPrice(productId as String) as String
  product = getProductById(productId)

  if product <> invalid then
    priceInDollars = product.price / 100
    return "$" + Str(priceInDollars).Trim()
  end if

  return "$0.00"
end function

' Cancel subscription (for future use)
sub cancelSubscription()
  ' Roku subscriptions auto-renew by default
  ' User must cancel through Roku Account settings
  ? "RokuPay: Please manage subscriptions through your Roku account settings"
end sub
