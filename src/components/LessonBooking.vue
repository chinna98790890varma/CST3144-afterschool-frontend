<template>
  <div id="app">
    <nav class="navbar navbar-dark bg-primary">
      <div class="container-fluid">
        <span class="navbar-brand mb-0 h1">
          <i class="fas fa-graduation-cap me-2"></i>
          After-School Classes
        </span>
        <button class="btn btn-light" @click="toggleView">
          <i class="fas fa-shopping-cart me-2"></i>
          Cart ({{ cart.length }})
        </button>
      </div>
    </nav>

    
    <div class="container mt-4">
      <div v-if="!showCart">
        <h2 class="mb-4">Available Classes</h2>
        
        <div class="search-container">
          <div class="input-group search-bar-wrapper">
            <span class="input-group-text search-icon-wrapper"><i class="fas fa-search"></i></span>
            <input 
              type="text" 
              class="form-control search-input" 
              placeholder="Search by subject, location, price, or availability..."
              v-model="searchQuery"
              @input="handleSearchInput"
            >
          </div>
        </div>

        <div class="sort-container">
          <div class="row">
            <div class="col-md-3">
              <label class="form-label">Sort By:</label>
              <select class="form-select" v-model="sortBy" @change="sortLessons">
                <option value="">None</option>
                <option value="subject">Subject</option>
                <option value="location">Location</option>
                <option value="price">Price</option>
                <option value="space">Availability</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Order:</label>
              <select class="form-select" v-model="sortOrder" @change="sortLessons">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row" v-if="!loading">
          <div class="col-md-6 col-lg-4" v-for="lesson in displayedLessons" :key="lesson._id">
            <div class="card lesson-card">
              <div class="card-body text-center">
                <img v-if="getLessonImage(lesson.subject)" :src="getLessonImage(lesson.subject)" class="lesson-image mb-3" :alt="lesson.subject">
                <i v-else :class="['fas', lesson.icon || 'fa-book', 'icon-large mb-3']"></i>
                <h5 class="card-title">{{ lesson.subject }}</h5>
                <p class="card-text">
                  <i class="fas fa-map-marker-alt me-2"></i>{{ lesson.location }}<br>
                  <i class="fas fa-pound-sign me-2"></i>{{ lesson.price }}<br>
                  <span class="badge bg-info badge-availability">
                    <i class="fas fa-users me-1"></i>{{ lesson.space }} spaces available
                  </span>
                </p>
                <button 
                  class="btn btn-primary"
                  :disabled="lesson.space === 0"
                  @click="addToCart(lesson)"
                >
                  <i class="fas fa-cart-plus me-2"></i>
                  {{ lesson.space === 0 ? 'Sold Out' : 'Add to Cart' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-if="!loading && displayedLessons.length === 0" class="alert alert-info">
          No lessons found.
        </div>
      </div>

      <div v-if="showCart">
        <h2 class="mb-4">Shopping Cart</h2>
        
        <div v-if="cart.length === 0" class="alert alert-info">
          Your cart is empty. <a href="#" @click="toggleView">Browse lessons</a>
        </div>

        <div v-else>
          <div class="cart-item" v-for="(item, index) in cart" :key="index">
            <div class="row align-items-center">
              <div class="col-md-6">
                <h5>{{ item.subject }}</h5>
                <p class="text-muted mb-0">
                  <i class="fas fa-map-marker-alt me-2"></i>{{ item.location }}<br>
                  <i class="fas fa-pound-sign me-2"></i>{{ item.price }} per class
                </p>
              </div>
              <div class="col-md-3">
                <label class="form-label">Quantity:</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="item.quantity"
                  min="1"
                  :max="item.space + item.quantity"
                  @change="updateCartItem(index)"
                >
              </div>
              <div class="col-md-2">
                <strong>£{{ (item.price * item.quantity).toFixed(2) }}</strong>
              </div>
              <div class="col-md-1">
                <button class="btn btn-danger btn-sm" @click="removeFromCart(index)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-light rounded">
            <h4>Total: £{{ totalPrice.toFixed(2) }}</h4>
          </div>

          <button class="btn btn-secondary mt-3" @click="toggleView">
            <i class="fas fa-arrow-left me-2"></i>Back to Lessons
          </button>
        </div>
      </div>

      <div class="modal fade" id="checkoutModal" tabindex="-1" ref="checkoutModalRef">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Checkout</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="checkout">
                <div class="mb-3">
                  <label class="form-label">Name *</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="checkoutForm.name"
                    @input="validateForm"
                    placeholder="Enter your name (letters only)"
                    required
                  >
                  <div class="text-danger small" v-if="checkoutForm.name && !isValidName">
                    Name must contain only letters
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Phone *</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="checkoutForm.phone"
                    @input="validateForm"
                    placeholder="Enter your phone (numbers only)"
                    required
                  >
                  <div class="text-danger small" v-if="checkoutForm.phone && !isValidPhone">
                    Phone must contain only numbers
                  </div>
                </div>
                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-checkout"
                    :disabled="!isFormValid"
                  >
                    <i class="fas fa-check me-2"></i>Complete Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div v-if="orderSuccess" class="alert alert-success alert-dismissible fade show mt-4" role="alert">
        <h4 class="alert-heading"><i class="fas fa-check-circle me-2"></i>Order Confirmed!</h4>
        <p>Thank you, {{ orderCustomerName }}! Your order has been placed successfully.</p>
        <p class="mb-0">Order total: £{{ orderTotal.toFixed(2) }}</p>
        <button type="button" class="btn-close" @click="orderSuccess = false"></button>
      </div>
      <div v-if="showCart && cart.length > 0" class="mt-4">
        <button class="btn btn-success btn-lg btn-checkout" @click="openCheckout">
          <i class="fas fa-shopping-cart me-2"></i>Proceed to Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Modal } from 'bootstrap'

const lessons = ref([])
const displayedLessons = ref([])
const filteredLessons = ref([])
const cart = ref([])
const showCart = ref(false)
const loading = ref(true)
const searchQuery = ref('')
const sortBy = ref('')
const sortOrder = ref('asc')
const checkoutForm = ref({
  name: '',
  phone: ''
})
const orderSuccess = ref(false)
const orderTotal = ref(0)
const orderCustomerName = ref('')
const apiUrl = import.meta.env.VITE_API_URL || 'https://cst3144-afterschool-backend.onrender.com'

const checkoutModalRef = ref(null)
let checkoutModal = null
const totalPrice = computed(() => {
  return cart.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

const isValidName = computed(() => {
  return /^[A-Za-z\s]+$/.test(checkoutForm.value.name)
})

const isValidPhone = computed(() => {
  return /^\d+$/.test(checkoutForm.value.phone)
})

const isFormValid = computed(() => {
  return isValidName.value && isValidPhone.value && 
         checkoutForm.value.name.trim() !== '' && 
         checkoutForm.value.phone.trim() !== ''
})

watch([sortBy, sortOrder], () => {
  if (lessons.value.length > 0) {
    sortLessons()
  }
})

watch(searchQuery, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    performSearch()
  }
})

onMounted(() => {
  fetchLessons()
  nextTick(() => {
    if (checkoutModalRef.value) {
      checkoutModal = new Modal(checkoutModalRef.value)
    }
  })
})

function getLessonImage(subject) {
  const map = {
    'Mathematics': 'images/math.png',
    'English Literature': 'images/english.png',
    'Science': 'images/science.png',
    'Art & Design': 'images/art.png',
    'Music': 'images/music.png',
    'Physical Education': 'images/pe.svg',
    'Computer Science': 'images/cs.svg',
    'Geography': 'images/geography.svg',
    'History': 'images/history.svg',
    'French Language': 'images/french.svg',
    'Drama': 'images/drama.svg',
    'Cooking': 'images/cooking.svg',
    'Physics': 'images/physics.svg'
  }
  return map[subject] || null
}

function fetchLessons() {
  loading.value = true
  fetch(`${apiUrl}/lessons`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      lessons.value = data
      if (searchQuery.value.trim()) {
        performSearch()
      } else {
        filteredLessons.value = [...data]
        applyFiltersAndSort()
      }
      loading.value = false
    })
    .catch(error => {
      console.error('Error fetching lessons:', error)
      alert('Failed to load lessons. Please check your backend connection.')
      loading.value = false
    })
}

function handleSearchInput(event) {
  const query = event.target.value.trim()
  searchQuery.value = query
  performSearch()
}

function performSearch() {
  const query = searchQuery.value.trim()
  
  const searchUrl = `${apiUrl}/search?query=${encodeURIComponent(query)}`
  
  console.log('Searching for:', query, 'URL:', searchUrl)
  
  fetch(searchUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Search request failed')
      }
      return response.json()
    })
    .then(data => {
      console.log('Search results:', data.length, 'lessons found')
      console.log('Search results data:', data)
      filteredLessons.value = Array.isArray(data) ? data : []
      if (query === '') {
        lessons.value = filteredLessons.value
      }
      applyFiltersAndSort()
    })
    .catch(error => {
      console.error('Error searching lessons:', error)
      if (lessons.value.length > 0) {
        console.log('Using local fallback search')
        const localQuery = query.toLowerCase()
        filteredLessons.value = lessons.value.filter(lesson => {
          return (
            (lesson.subject && lesson.subject.toLowerCase().includes(localQuery)) ||
            (lesson.location && lesson.location.toLowerCase().includes(localQuery)) ||
            (lesson.price && lesson.price.toString().includes(localQuery)) ||
            (lesson.space !== undefined && lesson.space.toString().includes(localQuery))
          )
        })
        applyFiltersAndSort()
      }
    })
}

function applyFiltersAndSort() {
  let lessonsToDisplay = [...filteredLessons.value]
  
  if (sortBy.value) {
    lessonsToDisplay.sort((a, b) => {
      let aVal = a[sortBy.value]
      let bVal = b[sortBy.value]
      
      if (aVal === null || aVal === undefined) aVal = ''
      if (bVal === null || bVal === undefined) bVal = ''
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      let comparison = 0
      if (aVal > bVal) {
        comparison = 1
      } else if (aVal < bVal) {
        comparison = -1
      }
      
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  }
  
  displayedLessons.value = lessonsToDisplay
  console.log('Displayed lessons updated:', displayedLessons.value.length)
}

function sortLessons() {
  applyFiltersAndSort()
}

function addToCart(lesson) {
  if (lesson.space === 0) {
    return
  }
  
  const existingIndex = cart.value.findIndex(item => item._id === lesson._id)
  
  if (existingIndex >= 0) {
    if (cart.value[existingIndex].quantity < cart.value[existingIndex].space + cart.value[existingIndex].quantity) {
      cart.value[existingIndex].quantity++
    }
  } else {
    cart.value.push({
      _id: lesson._id,
      subject: lesson.subject,
      location: lesson.location,
      price: lesson.price,
      space: lesson.space,
      quantity: 1
    })
  }
  
  lesson.space--
  
  const lessonIndex = lessons.value.findIndex(l => l._id === lesson._id)
  if (lessonIndex >= 0) {
    if (lessons.value[lessonIndex] !== lesson) {
      lessons.value[lessonIndex].space--
    }
  }
}

function removeFromCart(index) {
  const item = cart.value[index]
  
  const lessonIndex = lessons.value.findIndex(l => l._id === item._id)
  if (lessonIndex >= 0) {
    lessons.value[lessonIndex].space += item.quantity
  }
  
  cart.value.splice(index, 1)
}

function updateCartItem(index) {
  const item = cart.value[index]
  const maxQuantity = item.space + item.quantity
  
  if (item.quantity < 1) {
    item.quantity = 1
  } else if (item.quantity > maxQuantity) {
    item.quantity = maxQuantity
  }
  
  const lessonIndex = lessons.value.findIndex(l => l._id === item._id)
  if (lessonIndex >= 0) {
    const originalSpace = lessons.value[lessonIndex].space
  }
}

function toggleView() {
  showCart.value = !showCart.value
}

function openCheckout() {
  checkoutForm.value = { name: '', phone: '' }
  orderSuccess.value = false
  
  if (checkoutModal) {
    checkoutModal.show()
  } else if (checkoutModalRef.value) {
    checkoutModal = new Modal(checkoutModalRef.value)
    checkoutModal.show()
  }
}

function validateForm() {
}

function checkout() {
  if (!isFormValid.value) {
    return
  }
  
  const orderData = {
    name: checkoutForm.value.name.trim(),
    phone: checkoutForm.value.phone.trim(),
    lessons: cart.value.map(item => ({
      id: item._id,
      quantity: item.quantity
    }))
  }
  
  fetch(`${apiUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || 'Order failed')
        })
      }
      return response.json()
    })
    .then(order => {
      console.log('Order created:', order)
      
      orderTotal.value = totalPrice.value
      orderCustomerName.value = checkoutForm.value.name.trim()
      
      if (checkoutModal) {
        checkoutModal.hide()
      }
      
      orderSuccess.value = true
      
      cart.value = []
      checkoutForm.value.name = ''
      checkoutForm.value.phone = ''
      showCart.value = false
      
      fetchLessons()
    })
    .catch(error => {
      console.error('Error creating order:', error)

      alert('Failed to create order: ' + error.message)
    })
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding-bottom: 2rem;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  padding: 1rem 0;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.5px;
}

.navbar-brand i {
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.navbar .btn-light {
  background: rgba(255,255,255,0.95);
  border: none;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.navbar .btn-light:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.container {
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  margin-top: 2rem;
  margin-bottom: 2rem;
}

h2 {
  color: #333;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #667eea;
}

.lesson-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 25px;
  border: none;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  background: #fff;
  height: 100%;
}

.lesson-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.lesson-card .card-body {
  padding: 2rem 1.5rem;
}

.icon-large {
  font-size: 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  display: inline-block;
  transition: transform 0.3s ease;
}

.lesson-card:hover .icon-large {
  transform: scale(1.1) rotate(5deg);
}

.lesson-image {
  height: 120px;
  width: 100%;
  object-fit: contain;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.lesson-card:hover .lesson-image {
  transform: scale(1.1);
}

.card-title {
  color: #333;
  font-weight: 700;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.card-text {
  color: #666;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.card-text i {
  color: #667eea;
  width: 20px;
}

.badge-availability {
  font-size: 0.95rem;
  padding: 10px 15px;
  border-radius: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%) !important;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 25px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
  border-radius: 25px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6);
}

.btn-danger {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  transform: scale(1.1) rotate(90deg);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  border: none;
  border-radius: 25px;
  font-weight: 600;
}

.btn-checkout {
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  border-radius: 25px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.search-container {
  margin-bottom: 30px;
}

.search-bar-wrapper {
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
  border-radius: 50px;
  overflow: hidden;
  background: white;
  border: 2px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.search-bar-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.search-icon-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px 0 0 50px;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon-wrapper i {
  font-size: 1.1rem;
}

.search-input {
  border: none;
  border-radius: 0 50px 50px 0;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.search-input:focus {
  border: none;
  box-shadow: none;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.input-group-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.form-control {
  border-radius: 10px;
  border: 2px solid #e0e0e0;
  padding: 0.75rem 1.25rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.sort-container {
  margin-bottom: 30px;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 15px;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-select {
  border-radius: 10px;
  border: 2px solid #e0e0e0;
  padding: 0.6rem 1rem;
  transition: all 0.3s ease;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.cart-item {
  border-bottom: 2px solid #e9ecef;
  padding: 20px;
  margin-bottom: 15px;
  background: #f8f9fa;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.cart-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.cart-item h5 {
  color: #333;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.cart-item .text-muted {
  color: #666 !important;
}

.cart-item .form-control {
  border-radius: 10px;
}

.cart-item strong {
  color: #667eea;
  font-size: 1.2rem;
}

.bg-light.rounded {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white;
  padding: 1.5rem !important;
  border-radius: 15px !important;
}

.bg-light.rounded h4 {
  color: white;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  border: none;
}

.modal-content {
  border-radius: 20px;
  border: none;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px 20px 0 0;
  border: none;
}

.modal-title {
  font-weight: 700;
}

.btn-close {
  filter: brightness(0) invert(1);
}

.modal-body {
  padding: 2rem;
}

.modal-body .form-control {
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.alert {
  border-radius: 15px;
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.alert-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.alert-success .alert-heading {
  color: white;
}

.alert-info {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  border-radius: 15px;
}

.alert-info a {
  color: #ffd700;
  text-decoration: underline;
  font-weight: 600;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
  color: #667eea;
}

.alert-info:has-text("No lessons found") {
  text-align: center;
  padding: 2rem;
}

@media (max-width: 768px) {
  .container {
    padding: 1.5rem;
    margin-top: 1rem;
  }
  
  .navbar-brand {
    font-size: 1.2rem;
  }
  
  .icon-large {
    font-size: 3rem;
  }
  
  .cart-item {
    padding: 15px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lesson-card {
  animation: fadeIn 0.5s ease-out;
}

.cart-item {
  animation: fadeIn 0.3s ease-out;
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
</style>
