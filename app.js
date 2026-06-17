
// ==========================================
// 1. Navigation & Mobile Menu
// ==========================================
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const mainHeader = document.querySelector('.main-header');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle Mobile Menu
if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const icon = menuToggle.querySelector('i');
    if (navMenu.classList.contains('open')) {
      icon.className = 'fa-solid fa-xmark';
    } else {
      icon.className = 'fa-solid fa-bars';
    }
  });
}

// Close mobile menu when a link is clicked
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (navMenu) navMenu.classList.remove('open');
    const icon = menuToggle ? menuToggle.querySelector('i') : null;
    if (icon) icon.className = 'fa-solid fa-bars';
  });
});

// Scroll Effects (Header size & active link styling)
window.addEventListener('scroll', () => {
  // Header background shade on scroll
  if (window.scrollY > 50) {
    mainHeader.style.padding = '5px 0';
    mainHeader.style.backgroundColor = 'rgba(15, 23, 42, 0.98)';
  } else {
    mainHeader.style.padding = '0';
    mainHeader.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
  }

  // Active Link Highlighting
  let current = '';
  const sections = document.querySelectorAll('section');
  const scrollPosition = window.scrollY + 120; // offset header height

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ==========================================
// 2. Interactive Photo Gallery & Uploads
// ==========================================
const galleryGrid = document.getElementById('galleryGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const photoUploadForm = document.getElementById('photoUploadForm');
const imageFileInput = document.getElementById('imageFile');
const fileLabelText = document.getElementById('fileLabelText');

// Load initial portfolio items from localstorage or use defaults
let uploadedImages = JSON.parse(localStorage.getItem('az_gallery_uploads')) || [];

function renderGallery() {
  // Clean custom uploads first to prevent duplicating defaults
  const existingUploads = galleryGrid.querySelectorAll('.gallery-item[data-category="uploads"]');
  existingUploads.forEach(el => el.remove());

  // Render client uploads
  uploadedImages.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'gallery-item';
    itemEl.setAttribute('data-category', 'uploads');
    
    // Also tag with secondary category so it works under regular filters
    const subCat = item.category || 'composite';
    itemEl.classList.add(`cat-${subCat}`);

    itemEl.innerHTML = `
      <img src="${item.dataUrl}" alt="${item.title}">
      <div class="gallery-item-overlay">
        <span class="gallery-item-category">Client Upload: ${subCat}</span>
        <h4>${item.title}</h4>
        <p>Verified custom client installation.</p>
      </div>
    `;
    galleryGrid.appendChild(itemEl);
  });
}

// Filter Functionality
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const filter = button.getAttribute('data-filter');
    const items = galleryGrid.querySelectorAll('.gallery-item');

    items.forEach(item => {
      if (filter === 'all') {
        item.style.display = 'block';
      } else if (filter === 'uploads') {
        if (item.getAttribute('data-category') === 'uploads') {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      } else {
        // Match standard category or subclass category
        const isUpload = item.getAttribute('data-category') === 'uploads';
        const matchesCategory = item.getAttribute('data-category') === filter;
        const matchesSubCategory = item.classList.contains(`cat-${filter}`);
        
        if (matchesCategory || (isUpload && matchesSubCategory)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      }
    });
  });
});

// Update File Input label text on select
if (imageFileInput) {
  imageFileInput.addEventListener('change', (e) => {
    const fileName = e.target.files[0] ? e.target.files[0].name : 'Choose Image File...';
    fileLabelText.textContent = fileName;
  });
}

// Handle Image Upload Submit
if (photoUploadForm) {
  photoUploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('uploadTitle').value.trim();
    const category = document.getElementById('uploadCategory').value;
    const file = imageFileInput.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      const dataUrl = event.target.result;
      
      const newUpload = {
        id: Date.now(),
        title: title,
        category: category,
        dataUrl: dataUrl
      };

      uploadedImages.push(newUpload);
      localStorage.setItem('az_gallery_uploads', JSON.stringify(uploadedImages));
      
      // Re-render and select Uploads tab
      renderGallery();
      const uploadsFilterBtn = document.querySelector('.filter-btn[data-filter="uploads"]');
      if (uploadsFilterBtn) uploadsFilterBtn.click();

      // Reset Form
      photoUploadForm.reset();
      fileLabelText.textContent = 'Choose Image File...';
      
      alert('Success! Your photo was added to the gallery. Feel free to view it in the "Client Uploads" section.');
    };

    reader.readAsDataURL(file);
  });
}

// Initial gallery render
renderGallery();

// ==========================================
// 3. Quick Cost Estimator Calculator
// ==========================================
const calcType = document.getElementById('calcType');
const calcSqFt = document.getElementById('calcSqFt');
const calcResult = document.getElementById('calcResult');

// Price configs per square foot
const priceMatrix = {
  'wood-pine': { rate: 28, label: 'Pine' },
  'wood-cedar': { rate: 40, label: 'Cedar' },
  'composite': { rate: 52, label: 'Composite' },
  'floor-install': { rate: 12, label: 'Floor Install' },
  'floor-refinish': { rate: 5.50, label: 'Floor Refinish' }
};

function calculateEstimate() {
  if (!calcType || !calcSqFt || !calcResult) return;
  
  const type = calcType.value;
  const area = parseFloat(calcSqFt.value) || 0;
  
  if (area < 10) {
    calcResult.textContent = '$0.00';
    return;
  }

  const rate = priceMatrix[type].rate;
  const baseCost = area * rate;
  
  // Calculate a realistic price range (e.g. -10% for low, +15% for high)
  const lowCost = Math.round(baseCost * 0.9);
  const highCost = Math.round(baseCost * 1.15);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  calcResult.textContent = `${formatter.format(lowCost)} - ${formatter.format(highCost)}`;
}

if (calcType && calcSqFt) {
  calcType.addEventListener('change', calculateEstimate);
  calcSqFt.addEventListener('input', calculateEstimate);
}

// ==========================================
// 4. Interactive Review & Testimonial Engine
// ==========================================
const reviewsList = document.getElementById('reviewsList');
const addReviewForm = document.getElementById('addReviewForm');
const ratingInputStars = document.getElementById('ratingInputStars');
const reviewRatingValue = document.getElementById('reviewRatingValue');

// Default initial reviews
const defaultReviews = [
  {
    name: 'David L.',
    project: 'Wooden Deck',
    rating: 5,
    body: 'A-Z Decks did an incredible job on our cedar wrap-around deck! From the initial quote design layout to the final structural cleanup, the team was fast, professional, and kept us updated. Truly "from blueprint to build we have you covered" is accurate.'
  },
  {
    name: 'Sarah M.',
    project: 'Hardwood Flooring',
    rating: 5,
    body: 'Our old white oak floors were scratched and worn down. A-Z Flooring sanded and refinished them with a fresh modern finish. They look completely new! They were incredibly clean and finished ahead of schedule. Highly recommend!'
  },
  {
    name: 'Michael T.',
    project: 'Composite Deck',
    rating: 4,
    body: 'Excellent work building our Trex deck. The composite materials are beautiful and the structure is incredibly solid. Deducted one star just because the shipping of railing kits was delayed, but the team came out on Saturday to finish it once the parts arrived. Great company.'
  }
];

let customReviews = JSON.parse(localStorage.getItem('az_custom_reviews')) || [];

function calculateReviewScores() {
  const allReviews = [...defaultReviews, ...customReviews];
  const total = allReviews.length;
  
  if (total === 0) return;

  // Compute stars average
  const sum = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
  const average = (sum / total).toFixed(1);
  
  document.getElementById('avgStars').textContent = average;
  document.getElementById('totalReviewsCount').textContent = `Based on ${total} reviews`;

  // Draw Stars Icons
  const starsWrapper = document.getElementById('avgStarsIcons');
  starsWrapper.innerHTML = '';
  const fullStars = Math.floor(average);
  const hasHalf = (average - fullStars) >= 0.3 && (average - fullStars) <= 0.8;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsWrapper.innerHTML += '<i class="fa-solid fa-star"></i>';
    } else if (i === fullStars + 1 && hasHalf) {
      starsWrapper.innerHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
    } else {
      starsWrapper.innerHTML += '<i class="fa-regular fa-star"></i>';
    }
  }

  // Count instances for bar graphs
  const distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
  allReviews.forEach(r => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating]++;
    }
  });

  // Update DOM bars
  for (let s = 1; s <= 5; s++) {
    const percentage = ((distribution[s] / total) * 100).toFixed(0);
    document.getElementById(`fill${s}`).style.width = `${percentage}%`;
    document.getElementById(`count${s}`).textContent = distribution[s];
  }
}

function renderReviewsList() {
  reviewsList.innerHTML = '';
  const allReviews = [...customReviews, ...defaultReviews]; // New ones first

  allReviews.forEach(review => {
    const card = document.createElement('div');
    card.className = 'review-card';
    
    // Draw star icons for individual review
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= review.rating) {
        starsHtml += '<i class="fa-solid fa-star"></i>';
      } else {
        starsHtml += '<i class="fa-regular fa-star"></i>';
      }
    }

    card.innerHTML = `
      <div class="review-header">
        <div>
          <h4 class="reviewer-name">${review.name}</h4>
          <span class="review-meta">
            <i class="fa-solid fa-circle-check verify-icon"></i> Verified Customer - <em>${review.project}</em>
          </span>
        </div>
        <div class="stars-display">
          ${starsHtml}
        </div>
      </div>
      <p class="review-body">${review.body}</p>
    `;
    reviewsList.appendChild(card);
  });
}

// Star rating input click handler
if (ratingInputStars) {
  const stars = ratingInputStars.querySelectorAll('i');
  
  stars.forEach(star => {
    star.addEventListener('click', (e) => {
      const selectedValue = parseInt(e.target.getAttribute('data-value'));
      reviewRatingValue.value = selectedValue;
      
      // Highlight stars up to selected value
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-value'));
        if (sVal <= selectedValue) {
          s.className = 'fa-solid fa-star';
        } else {
          s.className = 'fa-regular fa-star';
        }
      });
    });
  });
}

// Review submit handler
if (addReviewForm) {
  addReviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reviewName').value.trim();
    const project = document.getElementById('reviewProject').value;
    const rating = parseInt(reviewRatingValue.value);
    const body = document.getElementById('reviewText').value.trim();

    if (!rating) {
      alert('Please select a star rating.');
      return;
    }

    const newReview = {
      name,
      project,
      rating,
      body
    };

    customReviews.unshift(newReview);
    localStorage.setItem('az_custom_reviews', JSON.stringify(customReviews));
    
    renderReviewsList();
    calculateReviewScores();

    // Reset form
    addReviewForm.reset();
    reviewRatingValue.value = '';
    const stars = ratingInputStars.querySelectorAll('i');
    stars.forEach(s => s.className = 'fa-regular fa-star');

    alert('Thank you! Your review has been submitted successfully.');
  });
}

// Initial calculations and render
renderReviewsList();
calculateReviewScores();

// ==========================================
// 5. QR Code Dynamic Generation
// ==========================================
const qrCodeCanvas = document.getElementById('qrCodeCanvas');
const downloadQrBtn = document.getElementById('downloadQrBtn');

// Generate the canvas QR code using the imported QRCode library
if (qrCodeCanvas) {
  // We point it to the production URL. Users can modify this to match their registered domain.
  const siteUrl = 'https://a-z-decks-and-flooring.com';
  
  QRCode.toCanvas(qrCodeCanvas, siteUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: '#0f172a',  // Slate 900
      light: '#ffffff'  // White background
    }
  }, function (error) {
    if (error) {
      console.error('Failed to render client-side QR Code:', error);
    } else {
      console.log('QR Code successfully rendered on page canvas.');
    }
  });
}

// Handle QR Code Download button click
if (downloadQrBtn && qrCodeCanvas) {
  downloadQrBtn.addEventListener('click', () => {
    const dataUrl = qrCodeCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'a-z-decks-flooring-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// ==========================================
// 6. Contact & Free Estimate Form Handling
// ==========================================
const contactForm = document.getElementById('contactForm');
const formSuccessMessage = document.getElementById('formSuccessMessage');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simple verification
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    
    if (name && email && phone) {
      // Simulate form submission
      formSuccessMessage.style.display = 'flex';
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        formSuccessMessage.style.display = 'none';
      }, 6000);

      contactForm.reset();
    }
  });
}
