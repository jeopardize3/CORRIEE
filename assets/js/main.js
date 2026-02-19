/* ===========================
   CORRIESELLS - MAIN JS (cleaned)
   Consolidated site JS: cart, wishlist, product rendering, UI helpers
   =========================== */

// Local storage keys
const STORAGE_CART = 'corriesells_cart';
const STORAGE_USER = 'corriesells_user';

const MEMORY_STORAGE = {};

function safeStorageGet(key) {
    try {
        const raw = localStorage.getItem(key);
        if (raw !== null && raw !== undefined) return raw;
    } catch (e) {}
    return Object.prototype.hasOwnProperty.call(MEMORY_STORAGE, key) ? MEMORY_STORAGE[key] : null;
}

function safeStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
        return;
    } catch (e) {}
    MEMORY_STORAGE[key] = value;
}

function safeStorageRemove(key) {
    try {
        localStorage.removeItem(key);
        return;
    } catch (e) {}
    delete MEMORY_STORAGE[key];
}

function getWindowNameData() {
    try {
        const parsed = window.name ? JSON.parse(window.name) : null;
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
        return null;
    }
}

function setWindowNameData(patch) {
    if (!patch || typeof patch !== 'object') return;
    try {
        const current = getWindowNameData() || {};
        const next = { ...current, ...patch };
        window.name = JSON.stringify(next);
    } catch (e) {}
}

// Product metadata (images, descriptions, variants)
const PRODUCTS_DB = {
    'product-1': {
        id: 'product-1',
        name: 'Premium Linen Shirt',
        price: 89.99,
        category: 'Shirts',
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop',
            'https://user2408.na.imgto.link/public/20260213/c5bc32407d1b58c2b781aa3d019c8e29-2.avif',
            'https://user2408.na.imgto.link/public/20260213/e4dfef40d2019253bf0e42261c49ae1b-2.avif'
        ],
        description: 'Premium quality, ethically sourced organic linen shirt with timeless appeal. Perfect for casual or semi-formal occasions.',
        sizes: ['XS','S','M','L','XL'],
        colors: [{ name: 'White', code: '#ffffff' }, { name: 'Black', code: '#333333' }, { name: 'Beige', code: '#E8DCC8' }]
    },
    'product-2': {
        id: 'product-2', name: 'Silk Summer Dress', price: 124.99, category: 'Dresses',
        images: [
            'https://cdn.shopify.com/s/files/1/0742/6628/0191/files/PSBW0129-41_Baby_Blue_35046e87-e338-4169-8635-8cda4a267fd2.jpg?v=1753325186',
             'https://i.etsystatic.com/34563465/r/il/f1eb77/4203027955/il_570xN.4203027955_6n3w.jpg',
            'https://clothsvilla.com/cdn/shop/files/peach-luxuriously-plain-burberry-silk-frock-for-effortless-summer-elegance_3_1024x1024.jpg?v=1718795677'
        ],
        description: 'Lightweight silk dress with flowing silhouette, perfect for summer evenings.',
        sizes: ['S','M','L'], colors: [{ name: 'Teal', code: '#00838F' }, { name: 'Coral', code: '#F28C6B' }]
    },
    'product-3': {
        id: 'product-3', name: 'Casual Cotton Pants', price: 76.99, category: 'Bottoms',
        images: [
            'https://user2409.na.imgto.link/public/20260213/31639deb36c5ebb9bcf2fe95ba42a0fb-2.avif',
            'https://user2409.na.imgto.link/public/20260213/afd3320d946e75275c36c880161d641a-2.avif',
            'https://user2409.na.imgto.link/public/20260213/d32af82042b24fc99ca5028e22fb587e-2.avif'
        ],
        description: 'Comfortable cotton pants for everyday wear.', sizes: ['M','L','XL'], colors: [{ name: 'Gray', code: '#3d3e41' }]
    },
    'product-4': {
        id: 'product-4', name: 'Organic Cotton Jacket', price: 99.99, category: 'Hoodies',
        images: [
            'https://user2408.na.imgto.link/public/20260213/c282925fd037d062a2e09a1682a67558-2.avif',
            'https://user2409.na.imgto.link/public/20260213/2426a2533322db8a098ccbf05fc8c843-2.avif',
            'https://user2409.na.imgto.link/public/20260213/b5b7bb223438c404d3446077f1cee647-2.avif',
            'https://user2409.na.imgto.link/public/20260213/e2e5a1c15bd13b2dce38eca999bdbddc-2.avif'
        ],
        description: 'Cozy hoodie made from organic cotton.', sizes: ['S','M','L','XL'], colors: [{ name: 'Olive', code: '#4c5241' }]
    }
    ,
    'product-5': {
        id: 'product-5', name: 'Men\'s Casual Shirt', price: 59.99, category: 'Mens',
        images: [
            'https://user2408.na.imgto.link/public/20260213/e417f79694faba1073d4b7ccce30a750-1.avif',
            'https://user2408.na.imgto.link/public/20260213/c5bc32407d1b58c2b781aa3d019c8e29-2.avif',
            'https://user2408.na.imgto.link/public/20260213/e4dfef40d2019253bf0e42261c49ae1b-2.avif'
        ],
        description: 'Lightweight casual shirt in breathable fabric — great for everyday wear.',
        sizes: ['S','M','L','XL'], colors: [{ name: 'White', code: '#ffffff' }, { name: 'Blue', code: '#2B6CB0' }]
    },
    'product-6': {
        id: 'product-6', name: 'Premium Accessories Set', price: 49.99, category: 'Mens',
        images: [
            'https://m.media-amazon.com/images/I/715WAlsFLhL._SX679_.jpg'
        ],
        description: 'Adjustable baseball cap with embroidered logo, comfortable fit.',
        sizes: ['One Size'], colors: [{ name: 'Black', code: '#111111' }, { name: 'Olive', code: '#6B8E23' }]
    },
    'product-7': {
        id: 'product-7', name: 'Men\'s Cotton Pants', price: 69.99, category: 'Mens',
        images: [
            'https://user2409.na.imgto.link/public/20260213/03e80a88107d9a679113eca9dec14a9e-2-1.avif',
            'https://user2409.na.imgto.link/public/20260213/0c801578339a167488637f32b17aafa7-2.avif',
            'https://user2409.na.imgto.link/public/20260213/302971b1d08decffacbf64e933a99a2b-2.avif'],
        description: 'Durable cotton pants with a modern slim fit and multiple pockets.',
        sizes: ['M','L','XL'], colors: [{ name: 'Khaki', code: '#C3A87A' }, { name: 'Navy', code: '#2B3A67' }]
    },
    'product-8': {
        id: 'product-8', name: 'Men\'s Resort Shirt', price: 74.99, category: 'Mens',
        images: [
            'https://user2408.na.imgto.link/public/20260213/41595d1f03606a2c5fce96505b9c4485-2.avif',
            'https://user2408.na.imgto.link/public/20260213/1b0537c5d0c0d6ea663c397b563fc5ba-2.avif'],
        description: 'Relaxed resort shirt with soft drape and breathable material.',
        sizes: ['S','M','L','XL'], colors: [{ name: 'Beige', code: '#E8DCC8' }, { name: 'Teal', code: '#00838F' }]
    },
    'product-9': {
        id: 'product-9', name: 'Men\'s Slim Chinos', price: 79.99, category: 'Mens',
        images: [
            'https://user2408.na.imgto.link/public/20260213/818de5588d7337d08a3d17e426f9c4ba-2.avif',
            'https://user2409.na.imgto.link/public/20260213/66e3844402f2aea5c45f293c470bd952-2.avif'],
        description: 'Smart-casual chinos with a slim silhouette, suitable for work or weekend.',
        sizes: ['S','M','L','XL'], colors: [{ name: 'Stone', code: '#BDB3A0' }, { name: 'Charcoal', code: '#333333' }]
    }
    ,
    'product-10': {
        id: 'product-10', name: 'Floral Midi Dress', price: 119.00, category: 'Womens',
        images: [
            'https://i.pinimg.com/736x/4f/2e/7a/4f2e7a398509ba9b8e743c2627c90643.jpg',
            'https://i.pinimg.com/736x/57/02/6b/57026be12113a486e686f7ec738b8241.jpg',
            'https://i.pinimg.com/736x/6b/bf/46/6bbf468ca874be300680592eaef2b73a.jpg',
            'https://i.pinimg.com/736x/86/c6/c3/86c6c34996da69fd8e567ff5917a56bb.jpg'
        ],
        description: 'Elegant floral midi dress with breathable fabric and a flattering cut.',
        sizes: ['XS','S','M','L'], colors: [{ name: 'Floral', code: '#F7E7D9' }]
    },
    'product-11': {
        id: 'product-11', name: 'Summer Slip Dress', price: 89.50, category: 'Womens',
        images: [
            'https://i.pinimg.com/originals/a4/a5/d5/a4a5d51c15f754022f11bbe91aa8389f.jpg',
            'https://i.pinimg.com/736x/71/3c/c8/713cc8b87d657e88088ee4ff9eec544b.jpg',
            'https://i.pinimg.com/736x/f6/e9/f3/f6e9f36d2cfd4b42b74f0551ad29723d.jpg',
            'https://i.pinimg.com/736x/e8/14/02/e814024150b94a2327d8adc4023d8fe6.jpg'
        ],
        description: 'Lightweight slip dress ideal for warm days and evenings.',
        sizes: ['S','M','L'], colors: [{ name: 'Ivory', code: '#FFF8F0' }, { name: 'Rose', code: '#F2C6C2' }]
    }
    ,
    'product-12': {
        id: 'product-12', name: 'Marvin Kids Hoodie', price: 39.99, category: 'Kids',
        images: [
            'https://user2408.na.imgto.link/public/20260213/3d069dbd4c7364319108e9064a882e28-2.avif',
            'https://user2408.na.imgto.link/public/20260213/539f75c8a1132dcb4294168c2e18c889-2.avif',
            'https://user2408.na.imgto.link/public/20260213/6bf843d0d43d21ce02d4cf1a47bbf6f7-2.avif'
        ],
        description: 'Cozy Marvin-branded kids hoodie — soft, warm, and easy to wash.',
        sizes: ['2T','4T','6','8'], colors: [{ name: 'Blue', code: '#4A90E2' }, { name: 'Gray', code: '#CFCFCF' }]
    },
    'product-13': {
        id: 'product-13',
        name: 'Linen Beach Cover-Up',
        price: 64.99,
        category: 'Beachwear',
        images: [
            'https://www.fashionnova.com/cdn/shop/products/03-17-21_Studio1_JP_14-51-10_65_SD017_Gold_0378_RA.jpg',
            'https://i.etsystatic.com/10605902/r/il/efd2d4/3722029208/il_794xN.3722029208_imfp.jpg',
            'https://iconix.co.za/cdn/shop/products/womens-red-summer-rain-beach-cover-up-beach-cover-ups-iconix-307733_600x.png?v=1659034864',
            'https://salitreswimwear.com/cdn/shop/files/SEV_8092_733e51cb-1eb5-425f-b4b2-efc0f11c02f5.jpg?v=1682807576'
        ],
        description: 'Lightweight linen beachwear layer for warm days, poolside lounging, and coastal travel.',
        sizes: ['S','M','L','XL'],
        colors: [{ name: 'White', code: '#ffffff' }, { name: 'Beige', code: '#E8DCC8' }, { name: 'Teal', code: '#00838F' }]
    },
    'product-14': {
        id: 'product-14',
        name: 'Resort Beach Kaftan',
        price: 72.99,
        category: 'Beachwear',
        images: [
            'https://i.pinimg.com/736x/0d/c9/cc/0dc9cc5b236760e2f61027c8f6a2c348.jpg',
            'https://i.pinimg.com/1200x/8a/e1/58/8ae158544298961c34db957d1c55eb70.jpg',
            'https://i.pinimg.com/736x/2f/73/24/2f7324dc30f385abfbd1bbaff5049abe.jpg',
            'https://i.pinimg.com/736x/61/4c/5d/614c5d15ef1f47eb6f42747ec9baf97c.jpg'
        ],
        description: 'Flowy resort kaftan designed for beach days and breezy vacation evenings.',
        sizes: ['S','M','L','XL'],
        colors: [{ name: 'White', code: '#ffffff' }, { name: 'Beige', code: '#E8DCC8' }]
    },
    'product-15': {
        id: 'product-15',
        name: 'Coastal Swim Set',
        price: 58.99,
        category: 'Beachwear',
        images: [
            'https://m.media-amazon.com/images/I/6179Y99ysxL._AC_SX522_.jpg',
            'https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=900',
            'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=900'
        ],
        description: 'Comfort-fit swim set made for beachwear styling, pool days, and tropical travel.',
        sizes: ['S','M','L'],
        colors: [{ name: 'Black', code: '#111111' }, { name: 'Teal', code: '#00838F' }]
    },
    'product-16': {
        id: 'product-16',
        name: 'Printed Halter Beachwear Set',
        price: 69.99,
        category: 'Beachwear',
        images: [
            'https://i5.walmartimages.com/seo/Chiccall-Women-s-Summer-Beachwear-Printed-Halter-Tie-Front-High-Waisted-Boyshorts-Swimsuit-with-Cover-Up-Set-Multicolor-3-Piece_3b3cc936-99d4-4d94-8146-251ea82e5daf.029bd7eb9ed0ed6b12bf21d68fb9d99f.jpeg',
            'https://cdn.shopify.com/s/files/1/0664/0418/8384/files/Done3.jpg?v=1698682865',
            'https://cdn.shopify.com/s/files/1/0664/0418/8384/files/Done4_1.jpg?v=1698682944'
        ],
        description: 'Three-piece beachwear set with halter top, high-waisted shorts, and lightweight cover-up.',
        sizes: ['S','M','L','XL'],
        colors: [{ name: 'Multicolor', code: '#D4AF37' }, { name: 'Teal', code: '#00838F' }]
    },
    'product-17': {
        id: 'product-17',
        name: 'Anita Beach Bikini Set',
        price: 79.99,
        category: 'Beachwear',
        images: [
            'https://cdn-01.anita.com/media/catalog/category/2026/Bade/M6_8738-1_511_M6_8118_511_662x408.jpg',
            'https://i.pinimg.com/736x/af/70/1a/af701a27ec9ddbe501db968d7859a40f.jpg',
            'https://i.pinimg.com/736x/41/d6/57/41d657846fe06e88e5dabbea58b051f0.jpg',
            'https://i.pinimg.com/736x/36/82/a5/3682a55c7927480cf3b65c52eab4f880.jpg'
        ],
        description: 'Premium beach bikini set engineered for support, comfort, and all-day beachwear confidence.',
        sizes: ['S','M','L','XL'],
        colors: [{ name: 'Blue', code: '#4A90E2' }, { name: 'Black', code: '#111111' }]
    }
};

// Bulk-add all image files as products if not already present
(function addAllImageProducts() {
    const bulk = {
        "cap": [
            'https://i.pinimg.com/736x/30/d9/50/30d95081556603803f6c826765344a78.jpg',
            'https://i.pinimg.com/1200x/82/a3/ee/82a3ee46ef8311b09f14a8d4bfbd9f48.jpg'
        ],
        "dress": [
            "https://i.pinimg.com/1200x/fb/56/5d/fb565d4946b0a934debd01ac3f19aea3.jpg",
            "https://i.pinimg.com/736x/36/e7/51/36e751a27a3b2042ee1db7fc2f0b4251.jpg",
            "https://i.pinimg.com/1200x/95/58/4d/95584d40fa0372ac748d20d463b1c430.jpg",
            "https://i.pinimg.com/1200x/5b/9b/b8/5b9bb87aa1f1be21472ed66f9dc2fb7a.jpg"
        ],
        "hoodie": [
            "https://user2409.na.imgto.link/public/20260213/039130f723f9b52155a23df1878c85cb-2.avif",
            "https://user2409.na.imgto.link/public/20260213/053df9fd8063f6afebeffebf60b8f6c7-2.avif",
            "https://user2409.na.imgto.link/public/20260213/084da3705fbd9434a264fbfa0e2961db-2.avif",
            "https://user2409.na.imgto.link/public/20260213/0b69a125667880b045693b3d528cfbe9-2.avif",
            "https://user2409.na.imgto.link/public/20260213/15ffcf6afa4c1d336f5d707f7fb94817-2.avif",
            "https://user2409.na.imgto.link/public/20260213/175a82907778904ba925811a7d9f1a8a-2.avif",
            "https://user2409.na.imgto.link/public/20260213/19bef441c1a5e315ef183daf92bfa7d6-2.avif",
            "https://user2409.na.imgto.link/public/20260213/1ba59b3f743742446298f00cd163e886-2.avif",
            "https://user2409.na.imgto.link/public/20260213/1f24f0cb1f2f4963715473c994e22bf8-2-1.avif",
            "https://user2409.na.imgto.link/public/20260213/2426a2533322db8a098ccbf05fc8c843-2.avif",
            "https://user2409.na.imgto.link/public/20260213/2f5bf11263091e0ff989c44bc6f62f79-2.avif",
            "https://user2409.na.imgto.link/public/20260213/3cfb9f87cbdf905481eaa8f043667f71-2.avif",
            "https://user2409.na.imgto.link/public/20260213/4478f9b1d1added360fc2c95047af4be-2.avif",
            "https://user2409.na.imgto.link/public/20260213/4b0297090100b66c2495bfb9cae71c9b-2.avif",
            "https://user2409.na.imgto.link/public/20260213/5d4a582095f8803031732ac71adf7f52-2.avif",
            "https://user2409.na.imgto.link/public/20260213/5e5a5234cf7b009dc4d36e4430759fa0-2.avif",
            "https://user2409.na.imgto.link/public/20260213/5f29a29db9386c31e57cbed216345b38-2.avif",
            "https://user2409.na.imgto.link/public/20260213/6f123c6b317e6dca4d0b4202cf328a22-2.avif",
            "https://user2409.na.imgto.link/public/20260213/7319888fafda26e08baebe5538b0b35a-2.avif",
            "https://user2409.na.imgto.link/public/20260213/73c9efc7da1230b88575eba2ae03fb3d-2.avif",
            "https://user2409.na.imgto.link/public/20260213/7704d6ea493f7a811c8b55f2da76702e-2.avif",
            "https://user2409.na.imgto.link/public/20260213/7997dd28b5352355523af658ec41ebf2-2.avif",
            "https://user2409.na.imgto.link/public/20260213/8527fc8ca46e9f8e1515b0fa97a89230-2.avif",
            "https://user2409.na.imgto.link/public/20260213/92b0ef3267ba7c922bb726ca5f3983c7-2.avif",
            "https://user2408.na.imgto.link/public/20260213/9c73b7f3a4fcea9d93d4daca9103710a-2.avif",
            "https://user2409.na.imgto.link/public/20260213/b5b7bb223438c404d3446077f1cee647-2.avif",
            "https://user2409.na.imgto.link/public/20260213/e2e5a1c15bd13b2dce38eca999bdbddc-2.avif",
            "https://user2409.na.imgto.link/public/20260213/e6137cbba0b4fba697899b10879acd30-2.avif"
        ],
        "jacket": [
            "https://user2408.na.imgto.link/public/20260213/0fd912e63006f794b910abd42e54db6d-2.avif",
            "https://user2408.na.imgto.link/public/20260213/102f1c148dbfac28c25b3b622f93c6aa-2.avif",
            "https://user2408.na.imgto.link/public/20260213/2064fef1b1f9c519fe2a205e65326c26-2.avif",
            "https://user2408.na.imgto.link/public/20260213/2507be5b7707a170d264b8fc80f79b27-2.avif",
            "https://user2408.na.imgto.link/public/20260213/34f39c3ca13d029ba6ae1d0709dd267e-2.avif",
            "https://user2408.na.imgto.link/public/20260213/485325aefad931ea7e3eb70a3c8a550e-2.avif",
            "https://user2408.na.imgto.link/public/20260213/73310995ccf6d88b17ac8ccc495299ed-2.avif",
            "https://user2408.na.imgto.link/public/20260213/7f6b47f949f98b9d5d124f0d32551b58-2.avif",
            "https://user2408.na.imgto.link/public/20260213/8a3f7c6501febfe9282e3b44d115cbb8-2.avif",
            "https://user2408.na.imgto.link/public/20260213/8e12cb3f5cd7898fdaa1af0b3730e836-2.avif",
            "https://user2408.na.imgto.link/public/20260213/9decf24649dd6e70a5113545cdcf372a-2.avif",
            "https://user2408.na.imgto.link/public/20260213/a9ab3097743418412b8729ff59b1cf49-2.avif",
            "https://user2408.na.imgto.link/public/20260213/c27e93c2a19d9cf61bd09b38cb13144c-2.avif",
            "https://user2408.na.imgto.link/public/20260213/c282925fd037d062a2e09a1682a67558-2.avif",
            "https://user2408.na.imgto.link/public/20260213/f4ad44ac4c5f2f18ffde49aaf99d4bd0-2-1-1.avif",
            "https://user2408.na.imgto.link/public/20260213/fc338d31d122b2b5f70c581678912dd0-2.avif"
        ],
        "marvin": [
            "https://user2408.na.imgto.link/public/20260213/3d069dbd4c7364319108e9064a882e28-2.avif",
            "https://user2408.na.imgto.link/public/20260213/539f75c8a1132dcb4294168c2e18c889-2.avif",
            "https://user2408.na.imgto.link/public/20260213/6bf843d0d43d21ce02d4cf1a47bbf6f7-2.avif",
            "https://user2408.na.imgto.link/public/20260213/dfc890557881b74ceb339a295ac9e13f-2.avif",
            "https://user2408.na.imgto.link/public/20260213/e46a5bdbbf182d89d492d1458fce95b0-2.avif"
        ],
        "pants": [
            "https://user2409.na.imgto.link/public/20260213/03e80a88107d9a679113eca9dec14a9e-2-1.avif",
            "https://user2409.na.imgto.link/public/20260213/03e80a88107d9a679113eca9dec14a9e-2-1.avif",
            "https://user2409.na.imgto.link/public/20260213/0c801578339a167488637f32b17aafa7-2.avif",
            "https://user2409.na.imgto.link/public/20260213/22148e77f4854c92a5924d61cc99fc6e-2.avif",
            "https://user2409.na.imgto.link/public/20260213/302971b1d08decffacbf64e933a99a2b-2.avif",
            "https://user2409.na.imgto.link/public/20260213/3128f337087c7be6383ca8fa9857ebcc-2.avif",
            "https://user2409.na.imgto.link/public/20260213/31639deb36c5ebb9bcf2fe95ba42a0fb-2.avif",
            "https://user2409.na.imgto.link/public/20260213/3db4b6f6f0669224e78fa39e3d1e3955-2.avif",
            "https://user2409.na.imgto.link/public/20260213/46c92837a5a2e24ed2bba4e2c39e2471-2.avif",
            "https://user2409.na.imgto.link/public/20260213/47548db84f27e5d60c38fd8a7b0266cc-2.avif",
            "https://user2409.na.imgto.link/public/20260213/4ccc021eed71e68a32114116e9331a70-2.avif",
            "https://user2409.na.imgto.link/public/20260213/5f1a5702786369aec40271b45ca38860-2.avif",
            "https://user2409.na.imgto.link/public/20260213/5f955c87088a95799b03167846b42978-2.avif",
            "https://user2409.na.imgto.link/public/20260213/66e3844402f2aea5c45f293c470bd952-2.avif",
            "https://user2409.na.imgto.link/public/20260213/6d399804bfb3082d73c6e5ee9bcab81a-2.avif",
            "https://user2409.na.imgto.link/public/20260213/715e8d12980a526ac5df032afde29328-2.avif",
            "https://user2409.na.imgto.link/public/20260213/80fd50a66f1015e6faab7693f38c562d-2.avif",
            "https://user2408.na.imgto.link/public/20260213/818de5588d7337d08a3d17e426f9c4ba-2.avif",
            "https://user2409.na.imgto.link/public/20260213/8f9c2cde732c47408d78e5f5fc0fc657-2.avif",
            "https://user2409.na.imgto.link/public/20260213/8fbab85152c274030baa204f107bdf15-2.avif",
            "https://user2409.na.imgto.link/public/20260213/93c642fc6cb2e7ca605e4b1c8beb8dbe-2.avif",
            "https://user2409.na.imgto.link/public/20260213/ac10afc4750b6a219c480606de7e77b1-2.avif",
            "https://user2409.na.imgto.link/public/20260213/ada778819a122400d3c73eeadffa43da-2.avif",
            "https://user2409.na.imgto.link/public/20260213/afd3320d946e75275c36c880161d641a-2.avif",
            "https://user2409.na.imgto.link/public/20260213/ba24f1f2ab5f4fa812904a0c1902b569-2.avif",
            "https://user2409.na.imgto.link/public/20260213/d23c62d4519fbc968b282a0fdf24f0cc-2.avif",
            "https://user2409.na.imgto.link/public/20260213/d32af82042b24fc99ca5028e22fb587e-2.avif",
            "https://user2409.na.imgto.link/public/20260213/d40e4e1e3d077608c1eab63a4cf8ab68-2.avif",
            "https://user2409.na.imgto.link/public/20260213/dbb5df0ea21dbe56eb8428c57afd436e-2.avif",
            "https://user2409.na.imgto.link/public/20260213/e9d357d16a57bc5a6dd35662a588d6c8-2.avif",
            "https://user2409.na.imgto.link/public/20260213/f8c505af15edb473df309e54305d2561-2.avif",
            "https://user2409.na.imgto.link/public/20260213/feac2ca6ef89c7db2da52ab537171c96-2.avif"
        ],
        "shirt": [
            "https://user2408.na.imgto.link/public/20260213/1b0537c5d0c0d6ea663c397b563fc5ba-2.avif",
            "https://user2408.na.imgto.link/public/20260213/26db8afecf165dd5f3fcddacf01cfa78-2.avif",
            "https://user2408.na.imgto.link/public/20260213/3d08feec2b62fd7292f90d892daaaa1c-2.avif",
            "https://user2408.na.imgto.link/public/20260213/41595d1f03606a2c5fce96505b9c4485-2.avif",
            "https://user2408.na.imgto.link/public/20260213/9f6d59dc5fca3f91f258aecf2efa60b9-2.avif",
            "https://user2408.na.imgto.link/public/20260213/a0537eadf1e51cc9ddab02a4934a700f-2.avif",
            "https://user2408.na.imgto.link/public/20260213/b04114a56aca5ec45d4466fb911685ca-2.avif",
            "https://user2408.na.imgto.link/public/20260213/c1fe5823056b4729740920cd7a1cf57f-2.avif",
            "https://user2408.na.imgto.link/public/20260213/c29abe38267c11f6021cfae2bf53ccf8-2.avif",
            "https://user2408.na.imgto.link/public/20260213/c5bc32407d1b58c2b781aa3d019c8e29-2.avif",
            "https://user2408.na.imgto.link/public/20260213/e417f79694faba1073d4b7ccce30a750-1.avif",
            "https://user2408.na.imgto.link/public/20260213/e4dfef40d2019253bf0e42261c49ae1b-2.avif"
        ],
        "short": [
            "https://user2408.na.imgto.link/public/20260213/c1d03f39e2f82d362d92f4bc7a430a75-2.avif",
            "https://user2408.na.imgto.link/public/20260213/e3a0b1646d888462311ae98cc609b826-2.avif"
        ]
    };

    // compute starting index for new product ids
    const maxExisting = Object.keys(PRODUCTS_DB).reduce((m,k)=>Math.max(m, parseInt((k||'').split('-')[1])||0), 0);
    let nextIndex = maxExisting + 1;

    const descriptionTemplates = {
        cap: 'Classic adjustable cap with embroidered logo — comfortable everyday wear.',
        dress: 'Lightweight dress with flattering silhouette, perfect for warm days and evenings.',
        hoodie: 'Cozy hoodie with soft lining; a wardrobe staple for cooler days.',
        jacket: 'Lightweight jacket suitable for layering in transitional seasons.',
        marvin: 'Kids hoodie featuring Marvin design — soft, durable, and machine-washable.',
        pants: 'Durable pants with a modern fit — versatile for work or weekend.',
        shirt: 'Breathable casual shirt, easy-care and great for daily wear.',
        short: 'Comfortable shorts ideal for warm weather and active days.'
    };

    Object.keys(bulk).forEach(folder => {
        bulk[folder].forEach(fname => {
            // build src and simple name
            const isUrl = /^https?:\/\//i.test(fname);
            const safe = isUrl ? fname : fname.replace(/ /g, '%20');
            const src = isUrl ? safe : `/assets/images/${folder}/${safe}`;
            // skip if already present in any product images
            const already = Object.values(PRODUCTS_DB).some(p => (p.images||[]).includes(src));
            if (already) return;
            const id = `product-${nextIndex++}`;
            const fileLabel = isUrl ? fname.split('/').pop().split('?')[0] : fname;
            const baseName = fileLabel.split('.')[0].replace(/[-_\d]+$/,'').trim();
            const name = `${folder.charAt(0).toUpperCase()+folder.slice(1)} ${baseName || id}`;
            const shortDesc = descriptionTemplates[folder] || `Quality ${folder} piece.`;
            PRODUCTS_DB[id] = {
                id,
                name,
                price: Math.round((30 + Math.random()*100)*100)/100,
                category: folder.charAt(0).toUpperCase() + folder.slice(1),
                images: [src],
                description: shortDesc,
                longDescription: `${shortDesc} Auto-imported from the store image: ${fname}. Hand-selected to match CORRIESELLS style guidelines.`,
                sizes: ['S','M','L'],
                colors: [{ name: 'Default', code: '#CCCCCC' }]
            };
        });
    });
})();

// ---------------------------
// Display name + category helpers
// ---------------------------
const DISPLAY_NAME_ADJECTIVES = [
    'Signature', 'Essential', 'Classic', 'Modern', 'Heritage',
    'Coastal', 'Studio', 'Weekend', 'Refined', 'Luxe'
];

function formatCategoryLabel(category) {
    const raw = (category || '').toString().trim();
    if (!raw) return 'Collection';
    const lower = raw.toLowerCase();
    if (lower === 'mens' || lower === 'men') return "Men's";
    if (lower === 'womens' || lower === 'women') return "Women's";
    if (lower === 'kids' || lower === 'kid') return "Kids'";
    if (lower === 't-shirts' || lower === 'tshirts') return 'T-Shirts';
    return raw.replace(/\b\w/g, c => c.toUpperCase());
}

function formatDisplayName(p) {
    const name = (p && p.name ? p.name : '').trim();
    const looksAuto = /[a-f0-9]{6,}/i.test(name) || /product-\d+/i.test(name) || name.length < 4 || /%20|_/.test(name);
    if (name && !looksAuto) return name;
    const idNum = parseInt((p && p.id ? p.id : '').split('-')[1], 10) || 0;
    const adj = DISPLAY_NAME_ADJECTIVES[idNum % DISPLAY_NAME_ADJECTIVES.length];
    const cat = formatCategoryLabel(p && p.category ? p.category : 'Product');
    return `${adj} ${cat}`.replace(/\s+/g, ' ').trim();
}

const HIDDEN_DISPLAY_NAMES = new Set(['Modern Pants']);

function removeHiddenProducts() {
    Object.keys(PRODUCTS_DB).forEach((id) => {
        const product = PRODUCTS_DB[id];
        if (!product) return;
        const displayName = formatDisplayName(product);
        if (HIDDEN_DISPLAY_NAMES.has(displayName)) {
            delete PRODUCTS_DB[id];
        }
    });
}

removeHiddenProducts();

function formatLongDescription(p) {
    const base = (p && (p.longDescription || p.description)) ? (p.longDescription || p.description) : '';
    const cleaned = base.replace(/Auto-imported.*$/i, '').replace(/\s{2,}/g, ' ').trim();
    return cleaned || (p && p.description) || '';
}

function getPrimaryProductImage(product) {
    if (!product) return '';
    return product.heroImage || (product.images && product.images[0]) || product.image || '';
}

function getProductImageGallery(product) {
    if (!product) return [];

    const ordered = [];
    const seen = new Set();

    const pushUnique = (src) => {
        if (!src || seen.has(src)) return;
        seen.add(src);
        ordered.push(src);
    };

    pushUnique(getPrimaryProductImage(product));

    if (Array.isArray(product.images)) {
        product.images.forEach(pushUnique);
    } else {
        pushUnique(product.image);
    }

    return ordered;
}

function shouldSkipProductImageLoader(img) {
    const alt = (img?.getAttribute('alt') || '').trim().toLowerCase();
    return alt === 'premium linen shirt' || alt.includes('premium linen shirt');
}

function initProductImageLoaders(root = document) {
    if (!root) return;

    root.querySelectorAll('.product-image img').forEach((img) => {
        if (img.dataset.loaderBound === 'true') return;
        img.dataset.loaderBound = 'true';

        const wrapper = img.closest('.product-image');
        if (!wrapper) return;

        if (shouldSkipProductImageLoader(img)) {
            wrapper.classList.remove('is-loading', 'is-loaded');
            return;
        }

        if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');

        const showImage = () => {
            wrapper.classList.remove('is-loading');
            wrapper.classList.add('is-loaded');
        };

        wrapper.classList.add('is-loading');

        if (img.complete) {
            showImage();
            return;
        }

        img.addEventListener('load', showImage, { once: true });
        img.addEventListener('error', showImage, { once: true });
    });
}

// ---------------------------
// Size guide renderer
// ---------------------------
const SIZE_GUIDES = {
    womens: {
        note: 'Fit tip: If you are between sizes, we recommend sizing up for a relaxed fit.',
        rows: [
            ['XS', '31-32', '24-25', '34-35'],
            ['S', '33-34', '26-27', '36-37'],
            ['M', '35-36', '28-29', '38-39'],
            ['L', '37-39', '30-32', '40-42'],
            ['XL', '40-42', '33-35', '43-45']
        ]
    },
    mens: {
        note: 'Fit tip: True to size. For layering, choose one size up.',
        rows: [
            ['S', '35-37', '29-31', '35-37'],
            ['M', '38-40', '32-34', '38-40'],
            ['L', '41-43', '35-37', '41-43'],
            ['XL', '44-46', '38-40', '44-46'],
            ['XXL', '47-49', '41-43', '47-49']
        ]
    },
    kids: {
        note: 'Fit tip: Kids items allow for easy movement and everyday comfort.',
        rows: [
            ['2T', '20-21', '20-21', '21-22'],
            ['4T', '22-23', '21-22', '23-24'],
            ['6', '24-25', '22-23', '25-26'],
            ['8', '26-27', '23-24', '27-28']
        ]
    },
    unisex: {
        note: 'Fit tip: Unisex sizing with a modern, relaxed silhouette.',
        rows: [
            ['XS', '32-34', '26-28', '32-34'],
            ['S', '35-37', '29-31', '35-37'],
            ['M', '38-40', '32-34', '38-40'],
            ['L', '41-43', '35-37', '41-43'],
            ['XL', '44-46', '38-40', '44-46']
        ]
    }
};

function getSizeGuideKey(p) {
    const cat = ((p && p.category) || '').toLowerCase();
    if (cat.includes('women')) return 'womens';
    if (cat.includes('men')) return 'mens';
    if (cat.includes('kids')) return 'kids';
    if (/(dress|skirt)/.test(cat)) return 'womens';
    if (/(shirt|pants|bottom|hoodie|jacket|t-shirt)/.test(cat)) return 'mens';
    return 'unisex';
}

function renderSizeGuide(p) {
    const tableBody = document.getElementById('sizeGuideTable');
    const note = document.getElementById('sizeGuideNote');
    if (!tableBody) return;
    const key = getSizeGuideKey(p);
    const guide = SIZE_GUIDES[key] || SIZE_GUIDES.unisex;
    tableBody.innerHTML = guide.rows.map(r => `
        <tr>
            <td><strong>${r[0]}</strong></td>
            <td>${r[1]}</td>
            <td>${r[2]}</td>
            <td>${r[3]}</td>
        </tr>
    `).join('');
    if (note) note.textContent = guide.note;
}

function initProductTabs() {
    const tabs = Array.from(document.querySelectorAll('.tab-btn[data-tab]'));
    const panels = Array.from(document.querySelectorAll('.tab-panel[data-panel]'));
    if (!tabs.length || !panels.length) return;

    const activate = (name) => {
        tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === name));
        panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === name));
    };

    tabs.forEach(btn => {
        btn.addEventListener('click', () => activate(btn.dataset.tab));
    });

    const hash = (window.location.hash || '').replace('#', '');
    if (hash === 'reviews') activate('reviews');
    else if (hash === 'size-guide') activate('size');
    else activate('description');

    window.addEventListener('hashchange', () => {
        const next = (window.location.hash || '').replace('#', '');
        if (next === 'reviews') activate('reviews');
        if (next === 'size-guide') activate('size');
    });

    const writeBtn = document.getElementById('writeReviewBtn');
    const reviewForm = document.getElementById('reviewForm');
    if (writeBtn && reviewForm) {
        writeBtn.addEventListener('click', () => {
            reviewForm.classList.toggle('active');
            if (reviewForm.classList.contains('active')) reviewForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Thanks for your review! It will appear after moderation.', 'success');
            reviewForm.reset();
        });
    }
}

// ---------------------------
// Product navigation helpers
// ---------------------------
function getOrderedProductIds() {
    return Object.keys(PRODUCTS_DB || {});
}

function goToProductId(id) {
    if (!id) return;
    // compute relative path to product page depending on current location
    const base = window.location.pathname.includes('/pages/') ? 'product.html' : 'pages/product.html';
    window.location.href = `${base}?product=${id}`;
}

function goToNextProduct() {
    const ids = getOrderedProductIds();
    const idx = ids.indexOf(currentProductId);
    if (idx === -1) return;
    const next = ids[idx + 1];
    if (next) goToProductId(next);
}

function goToPrevProduct() {
    const ids = getOrderedProductIds();
    const idx = ids.indexOf(currentProductId);
    if (idx === -1) return;
    const prev = ids[idx - 1];
    if (prev) goToProductId(prev);
}

// ---------------------------
// PRODUCTS_DB consistency validator
// ---------------------------
function validateProductsDB() {
    const seenImages = {};
    Object.values(PRODUCTS_DB).forEach(p => {
        if (!p) return;
        // ensure images array
        if (!Array.isArray(p.images)) p.images = p.image ? [p.image] : [];
        // remove duplicates, normalize spaces -> %20
        p.images = Array.from(new Set((p.images||[]).map(s => (''+s).replace(/ /g, '%20'))));
        if (p.images.length === 0) p.images = ['/assets/images/logo.png'];
        // ensure name and category
        if (!p.name) p.name = p.id || 'Product';
        if (!p.category) p.category = 'Uncategorized';
        // ensure descriptions
        if (!p.description) p.description = p.longDescription || (p.name + ' — quality product from CORRIESELLS');
        if (!p.longDescription) p.longDescription = p.description + ' More details available on the product page.';
        // collect image usage for warnings
        p.images.forEach(img => {
            seenImages[img] = seenImages[img] || [];
            seenImages[img].push(p.id);
        });
    });

    // warn for images used by multiple products (informational only)
    Object.keys(seenImages).forEach(img => {
        const list = seenImages[img];
        if (list.length > 1) console.warn(`Image ${img} is used by multiple products: ${list.join(', ')}`);
    });
}
// Cached DOM
const body = document.body;
const cartIcon = document.querySelector('.cart-icon');
let cartSidebar = document.querySelector('.cart-sidebar');
let cartSidebarClose = document.querySelector('.cart-close');

// ---------------------------
// Utilities
// ---------------------------
function createLineId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `line_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function coerceCartArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.cart)) return value.cart;
    if (typeof value === 'object') return Object.values(value);
    return [];
}

function normalizeCart(cart) {
    if (!Array.isArray(cart)) return [];
    let changed = false;
    cart.forEach((item) => {
        if (!item) return;
        if (!item.lineId) { item.lineId = createLineId(); changed = true; }
        if (!Number.isFinite(item.price)) { item.price = Number(item.price) || 0; changed = true; }
        if (!Number.isFinite(item.quantity)) { item.quantity = Math.max(1, parseInt(item.quantity, 10) || 1); changed = true; }
    });
    if (changed) saveCart(cart);
    return cart;
}
function getCart() {
    try {
        const raw = safeStorageGet(STORAGE_CART);
        const parsed = raw ? JSON.parse(raw) : [];
        const cart = coerceCartArray(parsed);
        return normalizeCart(cart);
    } catch (e) { return []; }
}

function saveCart(cart) {
    safeStorageSet(STORAGE_CART, JSON.stringify(cart));
    setWindowNameData({
        corriesells_cart: cart,
        ts: Date.now()
    });
}

function showNotification(message, type = 'info', duration = 2500) {
    const validTypes = new Set(['success', 'error', 'warning', 'info']);
    const tone = validTypes.has(type) ? type : 'info';
    const timeout = Number.isFinite(duration) ? Math.max(1200, duration) : 2500;
    const iconByType = {
        success: 'fas fa-circle-check',
        error: 'fas fa-circle-xmark',
        warning: 'fas fa-triangle-exclamation',
        info: 'fas fa-circle-info'
    };

    const root = document.body || document.documentElement;
    if (!root) return;

    let stack = document.querySelector('.site-toast-stack');
    if (!stack) {
        stack = document.createElement('div');
        stack.className = 'site-toast-stack';
        stack.setAttribute('aria-live', 'polite');
        stack.setAttribute('aria-atomic', 'false');
        root.appendChild(stack);
    }

    const maxVisible = 4;
    while (stack.childElementCount >= maxVisible) {
        stack.firstElementChild.remove();
    }

    const toast = document.createElement('div');
    toast.className = `alert alert-${tone} site-toast`;
    toast.setAttribute('role', 'status');
    toast.dataset.state = 'enter';

    const iconWrap = document.createElement('span');
    iconWrap.className = 'site-toast-icon';
    const icon = document.createElement('i');
    icon.className = iconByType[tone];
    icon.setAttribute('aria-hidden', 'true');
    iconWrap.appendChild(icon);

    const messageEl = document.createElement('div');
    messageEl.className = 'site-toast-message';
    messageEl.textContent = String(message || '');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'site-toast-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Dismiss notification');
    closeBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';

    const progress = document.createElement('span');
    progress.className = 'site-toast-progress';
    const progressFill = document.createElement('span');
    progressFill.className = 'site-toast-progress-fill';
    progressFill.style.animationDuration = `${timeout}ms`;
    progress.appendChild(progressFill);

    toast.appendChild(iconWrap);
    toast.appendChild(messageEl);
    toast.appendChild(closeBtn);
    toast.appendChild(progress);
    stack.appendChild(toast);

    requestAnimationFrame(() => {
        toast.dataset.state = 'open';
    });

    let dismissed = false;
    let remaining = timeout;
    let startedAt = Date.now();
    let timeoutId = null;

    const removeToast = () => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
        if (stack && stack.childElementCount === 0) stack.remove();
    };

    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        clearTimeout(timeoutId);
        toast.dataset.state = 'closing';
        setTimeout(removeToast, 260);
    };

    const scheduleDismiss = (wait) => {
        startedAt = Date.now();
        timeoutId = setTimeout(dismiss, wait);
    };

    const pauseDismiss = () => {
        if (dismissed) return;
        clearTimeout(timeoutId);
        remaining = Math.max(200, remaining - (Date.now() - startedAt));
        toast.classList.add('is-paused');
    };

    const resumeDismiss = () => {
        if (dismissed) return;
        toast.classList.remove('is-paused');
        scheduleDismiss(remaining);
    };

    closeBtn.addEventListener('click', dismiss);
    toast.addEventListener('mouseenter', pauseDismiss);
    toast.addEventListener('mouseleave', resumeDismiss);

    scheduleDismiss(remaining);
}

let messageDialogState = {
    resolver: null,
    mode: 'alert'
};

function syncOverlayLockState() {
    const hasDrawerOpen = !!document.querySelector('[data-drawer].is-open');
    const dialogOpen = document.body.dataset.messageDialogOpen === 'true';
    document.body.classList.toggle('drawer-open', hasDrawerOpen || dialogOpen);
}

function ensureMessageDialog() {
    let backdrop = document.getElementById('siteMessageDialog');
    if (backdrop) {
        return {
            backdrop,
            title: document.getElementById('siteDialogTitle'),
            message: document.getElementById('siteDialogMessage'),
            cancelBtn: backdrop.querySelector('.site-dialog-cancel'),
            confirmBtn: backdrop.querySelector('.site-dialog-confirm'),
            closeBtn: backdrop.querySelector('.site-dialog-close')
        };
    }

    backdrop = document.createElement('div');
    backdrop.id = 'siteMessageDialog';
    backdrop.className = 'site-dialog-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
        <div class="site-dialog" role="dialog" aria-modal="true" aria-labelledby="siteDialogTitle" aria-describedby="siteDialogMessage">
            <div class="site-dialog-header">
                <h3 id="siteDialogTitle">Notice</h3>
                <button class="site-dialog-close" type="button" aria-label="Close">&times;</button>
            </div>
            <div class="site-dialog-body">
                <p id="siteDialogMessage"></p>
            </div>
            <div class="site-dialog-actions">
                <button class="btn btn-outline site-dialog-cancel" type="button">Cancel</button>
                <button class="btn btn-primary site-dialog-confirm" type="button">OK</button>
            </div>
        </div>
    `;
    (document.body || document.documentElement).appendChild(backdrop);

    const title = document.getElementById('siteDialogTitle');
    const message = document.getElementById('siteDialogMessage');
    const cancelBtn = backdrop.querySelector('.site-dialog-cancel');
    const confirmBtn = backdrop.querySelector('.site-dialog-confirm');
    const closeBtn = backdrop.querySelector('.site-dialog-close');

    const closeDialog = (result) => {
        if (!backdrop.classList.contains('active')) return;
        backdrop.classList.remove('active');
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.dataset.messageDialogOpen = 'false';
        syncOverlayLockState();
        const resolver = messageDialogState.resolver;
        messageDialogState.resolver = null;
        if (resolver) resolver(result);
    };

    confirmBtn.addEventListener('click', () => closeDialog(true));
    cancelBtn.addEventListener('click', () => closeDialog(false));
    closeBtn.addEventListener('click', () => closeDialog(false));
    backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) closeDialog(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && backdrop.classList.contains('active')) {
            closeDialog(false);
        }
    });

    return { backdrop, title, message, cancelBtn, confirmBtn, closeBtn };
}

function showMessageDialog(message, options = {}) {
    const ui = ensureMessageDialog();
    const title = options.title || 'Notice';
    const confirmText = options.confirmText || 'OK';
    const tone = options.tone || 'info';

    ui.backdrop.classList.remove('tone-success', 'tone-error', 'tone-warning', 'tone-info');
    ui.backdrop.classList.add(`tone-${tone}`);

    ui.title.textContent = title;
    ui.message.textContent = String(message || '');
    ui.cancelBtn.style.display = 'none';
    ui.confirmBtn.textContent = confirmText;

    ui.backdrop.classList.add('active');
    ui.backdrop.setAttribute('aria-hidden', 'false');
    document.body.dataset.messageDialogOpen = 'true';
    syncOverlayLockState();

    return new Promise((resolve) => {
        messageDialogState.mode = 'alert';
        messageDialogState.resolver = resolve;
        ui.confirmBtn.focus();
    });
}

function showConfirmDialog(options = {}) {
    const ui = ensureMessageDialog();
    const title = options.title || 'Please Confirm';
    const message = options.message || 'Are you sure you want to continue?';
    const confirmText = options.confirmText || 'Confirm';
    const cancelText = options.cancelText || 'Cancel';
    const tone = options.tone || 'warning';

    ui.backdrop.classList.remove('tone-success', 'tone-error', 'tone-warning', 'tone-info');
    ui.backdrop.classList.add(`tone-${tone}`);

    ui.title.textContent = title;
    ui.message.textContent = message;
    ui.cancelBtn.style.display = 'inline-flex';
    ui.cancelBtn.textContent = cancelText;
    ui.confirmBtn.textContent = confirmText;

    ui.backdrop.classList.add('active');
    ui.backdrop.setAttribute('aria-hidden', 'false');
    document.body.dataset.messageDialogOpen = 'true';
    syncOverlayLockState();

    return new Promise((resolve) => {
        messageDialogState.mode = 'confirm';
        messageDialogState.resolver = resolve;
        ui.confirmBtn.focus();
    });
}

function stashCheckoutCart() {
    try {
        const cart = getCart();
        if (!cart || !cart.length) return;
        setWindowNameData({
            corriesells_cart: cart,
            ts: Date.now()
        });
    } catch (e) {}
}

function buildCheckoutUrlFromCart(cart) {
    const base = window.location.pathname.includes('/pages/') ? 'checkout.html' : 'pages/checkout.html';
    try {
        if (cart && cart.length) {
            const payload = encodeURIComponent(JSON.stringify({ items: cart }));
            if (payload.length < 2000) {
                return `${base}?cart=${payload}`;
            }
        }
    } catch (e) {}
    return base;
}

function buildCheckoutUrl() {
    try {
        const cart = getCart();
        return buildCheckoutUrlFromCart(cart);
    } catch (e) {
        return buildCheckoutUrlFromCart([]);
    }
}

function buildCheckoutRedirect() {
    // redirect is resolved relative to /pages/login.html, so use checkout.html (no pages/ prefix)
    let target = 'checkout.html';
    try {
        const cart = getCart();
        if (cart && cart.length) {
            const payload = encodeURIComponent(JSON.stringify({ items: cart }));
            if (payload.length < 2000) {
                target = `${target}?cart=${payload}`;
            }
        }
    } catch (e) {}
    return target;
}

function startCheckout() {
    if (!isUserLoggedIn()) {
        promptLoginForCheckout();
        return;
    }
    const cart = getCart();
    stashCheckoutCart();
    const url = buildCheckoutUrlFromCart(cart);
    if (url) {
        try {
            window.location.assign(url);
        } catch (e) {
            window.location.href = url;
        }
    }
}

function goToCheckout() {
    startCheckout();
}

function ensureCartUIElements() {
    // Full-page cart: we only ensure badges exist.
    cartSidebar = document.querySelector('.cart-sidebar');
    cartSidebarClose = document.querySelector('.cart-close');

    document.querySelectorAll('.cart-icon').forEach((icon) => {
        if (!icon.querySelector('.badge')) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.style.display = 'none';
            badge.textContent = '0';
            icon.appendChild(badge);
        }
    });
}

function trackPageView(pageName) {
    try {
        if (typeof gtag === 'function') {
            gtag('event', 'page_view', { page_title: pageName || document.title });
        }
    } catch (e) {
        // no-op if analytics is not configured
    }
}

// ---------------------------
// EmailJS (newsletter + contact)
// ---------------------------
const EMAILJS_CONFIG = {
    serviceId: 'service_e1tx4r4',
    templateId: 'template_l9k0qmn',
    publicKey: 'hzdZksYKjOVV6Yi73',
    toEmail: 'corriewhited@corriesells.com'
};

// ---------------------------
// reCAPTCHA v3
// ---------------------------
const RECAPTCHA_SITE_KEY = '6Lczk2ksAAAAAAQBz9yJZKTFJhtzAvPzvbljnOq-';
// Set to true only when you have a working server-side verification endpoint.
// For GitHub Pages (static hosting), keep this false to allow JS-only signup/login.
const RECAPTCHA_ENFORCE = false;
// Set this to your Vercel app URL when the frontend is hosted on GitHub Pages.
// Example: const API_BASE_URL = 'https://your-app.vercel.app';
const API_BASE_URL = '';

function normalizeApiBase(value) {
    return (value || '').toString().trim().replace(/\/+$/, '');
}

function getApiBase() {
    const fromWindow = typeof window !== 'undefined' ? (window.CORRIESELLS_API_BASE || '') : '';
    const fromMeta = typeof document !== 'undefined'
        ? document.querySelector('meta[name="corriesells-api-base"]')?.getAttribute('content')
        : '';
    return normalizeApiBase(fromWindow || fromMeta || API_BASE_URL);
}

function buildApiUrl(path) {
    const base = getApiBase();
    if (!path) return base || '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return base ? `${base}${cleanPath}` : cleanPath;
}

function getRecaptchaToken(action) {
    if (!window.grecaptcha || !window.grecaptcha.ready) return Promise.resolve(null);
    return new Promise((resolve) => {
        window.grecaptcha.ready(() => {
            window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
                .then(resolve)
                .catch(() => resolve(null));
        });
    });
}

function shouldEnforceRecaptcha() {
    if (!RECAPTCHA_ENFORCE) return false;
    const host = window.location.hostname || '';
    return host === 'corriesells.com' || host === 'www.corriesells.com';
}

async function verifyRecaptcha(action) {
    if (!shouldEnforceRecaptcha()) {
        return true;
    }

    const token = await getRecaptchaToken(action);
    if (!token) {
        showNotification('Verification failed. Please try again.', 'error');
        return false;
    }
    try {
        const res = await fetch(buildApiUrl('/api/recaptcha-verify'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, action })
        });
        if (!res.ok) throw new Error('Bad response');
        const data = await res.json();
        if (!data || !data.success) {
            showNotification('Verification failed. Please try again.', 'error');
            return false;
        }
        return true;
    } catch (error) {
        showNotification('Verification failed. Please try again.', 'error');
        return false;
    }
}

window.verifyRecaptcha = verifyRecaptcha;

function initEmailJS() {
    if (!window.emailjs || initEmailJS.initialized) return;
    emailjs.init(EMAILJS_CONFIG.publicKey);
    initEmailJS.initialized = true;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

// Backward-compatible alias used in auth pages
function validateEmail(value) {
    return isValidEmail(value);
}

window.validateEmail = validateEmail;

async function sendEmailJS(params) {
    if (!window.emailjs) {
        showNotification('Email service is unavailable. Please try again later.', 'error');
        console.error('EmailJS is not loaded.');
        return false;
    }
    initEmailJS();
    try {
        await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, params);
        return true;
    } catch (error) {
        console.error('EmailJS send failed:', error);
        showNotification('Message failed to send. Please try again.', 'error');
        return false;
    }
}

// ---------------------------
// Backdrop / Cart UI
// ---------------------------
function ensureCartBackdrop() {
    let backdrop = document.querySelector('.cart-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'cart-backdrop';
        Object.assign(backdrop.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.45)', zIndex: '1400'
        });
        backdrop.addEventListener('click', () => closeCart());
        document.body.appendChild(backdrop);
    }
    return backdrop;
}

function removeCartBackdrop() {
    document.querySelectorAll('.cart-backdrop').forEach(b => b.remove());
}

function goToCartPage() {
    const base = window.location.pathname.includes('/pages/') ? 'cart.html' : 'pages/cart.html';
    window.location.href = base;
}

function openCart() {
    goToCartPage();
}

function closeCart() {
    // no-op for full-page cart
}

// ---------------------------
// Cart operations
// ---------------------------
function addToCart(productId, quantity = 1, options = {}, config = {}) {
    if (!productId || !PRODUCTS_DB[productId]) {
        showNotification('Invalid product', 'error');
        return false;
    }

    const settings = {
        notify: true,
        openCart: false,
        message: 'Added to cart',
        ...config
    };

    const cart = getCart();
    const p = PRODUCTS_DB[productId];
    const override = Number.parseFloat(config.priceOverride);
    const unitPrice = Number.isFinite(override) ? override : (p.price || 0);
    const imageRef = typeof config.imageOverride === 'string' ? config.imageOverride.trim() : '';
    const useImageAsReference = imageRef.length > 0;
    const existing = cart.find(i =>
        i.id === productId &&
        JSON.stringify(i.options || {}) === JSON.stringify(options) &&
        Number(i.price) === Number(unitPrice) &&
        (!useImageAsReference || String(i.image || '') === imageRef)
    );
    if (existing) {
        existing.quantity = (existing.quantity || 0) + quantity;
        if (imageRef) {
            existing.image = imageRef;
        }
    } else {
        const img = imageRef || getPrimaryProductImage(p);
        cart.push({
            lineId: createLineId(),
            id: p.id,
            name: formatDisplayName(p),
            price: unitPrice,
            image: img,
            quantity: quantity,
            options: options
        });
    }
    saveCart(cart);
    if (settings.notify) showNotification(settings.message, 'success');
    updateCartUI();
    if (settings.openCart) openCart();
    return true;
}

function removeFromCart(idOrLineId) {
    const cart = getCart();
    let idx = cart.findIndex(i => i.lineId === idOrLineId);
    if (idx === -1) idx = cart.findIndex(i => i.id === idOrLineId);
    if (idx > -1) {
        cart.splice(idx, 1);
        saveCart(cart);
        updateCartUI();
    }
}

function updateCartItem(idOrLineId, qty) {
    const cart = getCart();
    const item = cart.find(i => i.lineId === idOrLineId) || cart.find(i => i.id === idOrLineId);
    if (!item) return;
    item.quantity = Math.max(0, parseInt(qty) || 0);
    if (item.quantity <= 0) removeFromCart(item.lineId || item.id);
    else saveCart(cart);
    updateCartUI();
}

function updateCartTotal() {
    const cart = getCart();
    const total = cart.reduce((s,i)=>s + (i.price * i.quantity), 0);
    const el = document.querySelector('.cart-total-amount');
    if (el) el.textContent = `$${total.toFixed(2)}`;
}

function updateCartUI() {
    const cart = getCart();
    const count = cart.reduce((s,i)=>s + (i.quantity||0), 0);
    document.querySelectorAll('.badge').forEach((badge) => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });

    const bodyEl = document.querySelector('.cart-body');
    if (!bodyEl) return;
    if (cart.length === 0) {
        bodyEl.innerHTML = '<p class="text-center text-muted" style="padding:var(--spacing-lg);">Your cart is empty</p>';
    } else {
        bodyEl.innerHTML = cart.map(item => {
            const p = PRODUCTS_DB[item.id];
            const displayName = p ? formatDisplayName(p) : item.name;
            return `
            <div class="cart-item">
                <div class="cart-item-image"><img src="${item.image}" alt=""></div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${displayName}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-decr" data-line-id="${item.lineId}" data-id="${item.id}">−</button>
                        <input class="qty-input" data-line-id="${item.lineId}" data-id="${item.id}" type="number" value="${item.quantity}" min="1" />
                        <button class="qty-incr" data-line-id="${item.lineId}" data-id="${item.id}">+</button>
                    </div>
                    <button class="btn btn-sm btn-outline remove-item" data-line-id="${item.lineId}" data-id="${item.id}">Remove</button>
                </div>
            </div>
        `;}).join('');

        // delegate behaviors
        bodyEl.querySelectorAll('.qty-decr').forEach(b => b.addEventListener('click', (e)=>{
            const lineId = e.currentTarget.dataset.lineId || e.currentTarget.dataset.id;
            const inp = bodyEl.querySelector(`.qty-input[data-line-id="${lineId}"]`) || bodyEl.querySelector(`.qty-input[data-id="${lineId}"]`);
            if (!inp) return;
            inp.value = Math.max(1, parseInt(inp.value||1) - 1);
            updateCartItem(lineId, inp.value);
        }));
        bodyEl.querySelectorAll('.qty-incr').forEach(b => b.addEventListener('click', (e)=>{
            const lineId = e.currentTarget.dataset.lineId || e.currentTarget.dataset.id;
            const inp = bodyEl.querySelector(`.qty-input[data-line-id="${lineId}"]`) || bodyEl.querySelector(`.qty-input[data-id="${lineId}"]`);
            if (!inp) return;
            inp.value = Math.max(1, parseInt(inp.value||1) + 1);
            updateCartItem(lineId, inp.value);
        }));
        bodyEl.querySelectorAll('.qty-input').forEach(i => i.addEventListener('change', (e)=>{
            const lineId = e.target.dataset.lineId || e.target.dataset.id;
            updateCartItem(lineId, e.target.value);
        }));
        bodyEl.querySelectorAll('.remove-item').forEach(b => b.addEventListener('click', (e)=>{
            const lineId = e.currentTarget.dataset.lineId || e.currentTarget.dataset.id;
            removeFromCart(lineId);
        }));
    }
    updateCartTotal();
    // safety cleanup if sidebar is not active
    if (!cartSidebar || !cartSidebar.classList.contains('active')) removeCartBackdrop();
    updateCheckoutLinks(cart);
}

function updateCheckoutLinks(cart) {
    const href = buildCheckoutUrlFromCart(cart || []);
    document.querySelectorAll('[data-checkout]').forEach((el) => {
        if (el.tagName === 'A') {
            el.setAttribute('href', href);
        }
    });
}

// ---------------------------
// Wishlist
// ---------------------------
function getWishlist() { try { return JSON.parse(safeStorageGet('corriesells_wishlist')||'[]'); } catch(e){return[];} }
function saveWishlist(w){ safeStorageSet('corriesells_wishlist', JSON.stringify(w)); }
function toggleWishlist(id){ if(!id) return; const w=getWishlist(); const idx=w.indexOf(id); if(idx>-1){ w.splice(idx,1); saveWishlist(w); showNotification('Removed from wishlist','info'); } else { w.push(id); saveWishlist(w); showNotification('Added to wishlist','success'); } updateWishlistIcons(); }
function addToWishlist(id){ toggleWishlist(id); }
function updateWishlistIcons() {
    document.querySelectorAll('[data-wishlist]').forEach(btn=>{
        const id = btn.getAttribute('data-wishlist');
        const inList = getWishlist().includes(id);
        const icon = btn.querySelector('i');
        if (icon) icon.className = inList ? 'fas fa-heart' : 'far fa-heart';
        btn.classList.toggle('liked', inList);
    });
}

// ---------------------------
// Product page render
// ---------------------------
let currentProductId = null;
function renderProductPage() {
    const mainImage = document.getElementById('mainImage');
    if (!mainImage) return;

    const params = new URLSearchParams(window.location.search);
    const productIds = getOrderedProductIds();
    if (!productIds.length) return;

    let id = params.get('product');
    if (!id || !PRODUCTS_DB[id]) {
        id = productIds[0];
        params.set('product', id);
        const query = params.toString();
        const hash = window.location.hash || '';
        window.history.replaceState({}, '', `${window.location.pathname}?${query}${hash}`);
    }

    const p = PRODUCTS_DB[id];
    if (!p) return;

    currentProductId = id;
    const displayName = formatDisplayName(p);
    const productGallery = getProductImageGallery(p);
    if (mainImage) {
        mainImage.src = productGallery[0] || '';
        mainImage.alt = displayName;
    }
    const category = document.getElementById('productCategory');
    if (category) category.textContent = formatCategoryLabel(p.category);
    const title = document.getElementById('productTitle'); if (title) title.textContent = displayName;
    const price = document.getElementById('productPrice');
    if (price) {
        const priceValue = (p.price || 0);
        price.textContent = `$${priceValue.toFixed(2)}`;
        price.dataset.price = priceValue.toFixed(2);
    }
    const desc = document.getElementById('productDescription'); if (desc) desc.textContent = p.description || formatLongDescription(p) || '';
    const longDesc = document.getElementById('productLongDescription'); if (longDesc) longDesc.textContent = formatLongDescription(p) || p.description || '';
    const addBtn = document.getElementById('addToCartBtn'); if (addBtn) addBtn.dataset.productId = id;
    const buyBtn = document.getElementById('buyNowBtn'); if (buyBtn) buyBtn.dataset.productId = id;
    const wishBtn = document.getElementById('productWishlistBtn'); if (wishBtn) wishBtn.setAttribute('data-wishlist', id);

    // Thumbnails
    try {
        const thumbs = document.getElementById('productThumbs');
        if (thumbs) {
            thumbs.innerHTML = '';
            productGallery.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = displayName;
                img.style.cursor = 'pointer';
                img.style.borderRadius = 'var(--radius-md)';
                img.addEventListener('click', () => { if (mainImage) mainImage.src = src; });
                thumbs.appendChild(img);
            });
        }
    } catch (e) { /* ignore */ }

    // Sizes
    try {
        const sizesEl = document.getElementById('sizeOptions');
        if (sizesEl) {
            sizesEl.innerHTML = '';
            const sizes = p.sizes || ['S','M','L'];
            sizes.forEach((s, i) => {
                const btn = document.createElement('button');
                btn.className = 'btn size-option' + (i===0 ? ' selected' : ' btn-outline');
                btn.textContent = s;
                btn.style.width = '50px'; btn.style.height = '50px'; btn.style.padding = '0';
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });
                sizesEl.appendChild(btn);
            });
        }
    } catch (e) { }

    // Colors
    try {
        const colorsEl = document.getElementById('colorOptions');
        if (colorsEl) {
            colorsEl.innerHTML = '';
            const colors = p.colors || [];
            colors.forEach((c, i) => {
                const div = document.createElement('div');
                div.className = 'color-option' + (i===0 ? ' selected' : '');
                div.setAttribute('data-color', c.name || c);
                div.style.width = '50px'; div.style.height = '50px'; div.style.borderRadius = '50%'; div.style.cursor = 'pointer';
                div.style.border = i===0 ? '3px solid var(--primary-color)' : '3px solid transparent';
                div.style.backgroundColor = c.code || c.name || '#ccc';
                div.addEventListener('click', () => {
                    document.querySelectorAll('.color-option').forEach(cn => cn.classList.remove('selected'));
                    div.classList.add('selected');
                });
                colorsEl.appendChild(div);
            });
        }
    } catch (e) { }

    try { updateWishlistIcons(); } catch(e){}
    try { renderSizeGuide(p); } catch(e){}
    try { initProductTabs(); } catch(e){}

    // Prev / Next buttons
    try {
        const prevBtn = document.getElementById('prevProductBtn');
        const nextBtn = document.getElementById('nextProductBtn');
        const ids = getOrderedProductIds();
        const idx = ids.indexOf(id);
        if (prevBtn) {
            if (idx > 0) { prevBtn.disabled = false; prevBtn.onclick = goToPrevProduct; }
            else { prevBtn.disabled = true; prevBtn.onclick = null; }
        }
        if (nextBtn) {
            if (idx > -1 && idx < ids.length - 1) { nextBtn.disabled = false; nextBtn.onclick = goToNextProduct; }
            else { nextBtn.disabled = true; nextBtn.onclick = null; }
        }
    } catch (e) {}

    // quantity controls on product page
    try {
        const qInc = document.getElementById('qty-increment');
        const qDec = document.getElementById('qty-decrement');
        const qInp = document.getElementById('productQuantity');
        if (qInc) qInc.addEventListener('click', ()=>{ if(qInp) qInp.value = Math.max(1, parseInt(qInp.value||1) + 1); });
        if (qDec) qDec.addEventListener('click', ()=>{ if(qInp) qInp.value = Math.max(1, parseInt(qInp.value||1) - 1); });
    } catch (e) {}
}

function parsePriceValue(value) {
    if (value == null) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const cleaned = String(value).replace(/[^0-9.]/g, '');
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
}

function getDisplayedProductPrice() {
    const priceInput = document.getElementById('productPriceInput');
    if (priceInput && priceInput.value) {
        const inputPrice = parsePriceValue(priceInput.value);
        if (Number.isFinite(inputPrice)) return inputPrice;
    }

    const priceEl = document.getElementById('productPrice');
    if (!priceEl) return null;
    const dataPrice = parsePriceValue(priceEl.dataset.price);
    if (Number.isFinite(dataPrice)) return dataPrice;
    return parsePriceValue(priceEl.textContent);
}

function getViewedProductImage() {
    const mainImage = document.getElementById('mainImage');
    if (mainImage && mainImage.src) return mainImage.src;
    return null;
}

function getCurrentProductSelection() {
    const btn = document.getElementById('addToCartBtn');
    const buyNowBtn = document.getElementById('buyNowBtn');
    const urlProduct = new URLSearchParams(window.location.search).get('product');
    const id = (btn && btn.dataset && btn.dataset.productId)
        || (buyNowBtn && buyNowBtn.dataset && buyNowBtn.dataset.productId)
        || currentProductId
        || (urlProduct && PRODUCTS_DB[urlProduct] ? urlProduct : null);

    const parsedQty = parseInt(document.getElementById('productQuantity')?.value, 10);
    const qty = Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 1;
    const size = document.querySelector('.size-option.selected')?.textContent?.trim() || null;
    const color = document.querySelector('.color-option.selected')?.getAttribute('data-color') || null;
    const options = {};
    if (size) options.size = size; if (color) options.color = color;
    const priceOverride = getDisplayedProductPrice();
    const imageOverride = getViewedProductImage();
    return { id, qty, options, priceOverride, imageOverride };
}

function handleAddToCart() {
    const selection = getCurrentProductSelection();
    if (!selection.id) return showNotification('Product not found','error');
    addToCart(selection.id, selection.qty, selection.options, {
        priceOverride: selection.priceOverride,
        imageOverride: selection.imageOverride
    });
}

function handleBuyNow() {
    const selection = getCurrentProductSelection();
    if (!selection.id) return showNotification('Product not found', 'error');
    if (!isUserLoggedIn()) {
        promptLoginForCheckout();
        return;
    }

    const added = addToCart(selection.id, selection.qty, selection.options, {
        notify: false,
        openCart: false,
        priceOverride: selection.priceOverride,
        imageOverride: selection.imageOverride
    });
    if (!added) return;

    showNotification('Proceeding to checkout...', 'success', 1000);
    setTimeout(() => {
        try {
            startCheckout();
        } catch (error) {
            const fallback = window.location.pathname.includes('/pages/') ? 'checkout.html' : 'pages/checkout.html';
            window.location.href = fallback;
        }
    }, 350);
}

function readStoredUser() {
    const raw = safeStorageGet(STORAGE_USER);
    let user = null;
    if (raw) {
        try {
            user = JSON.parse(raw);
        } catch (e) {
            user = null;
        }
    }
    if (!user) {
        const nameData = getWindowNameData();
        user = nameData && nameData.corriesells_user ? nameData.corriesells_user : null;
    }
    return syncUserWithStoredRecord(user);
}

function normalizeUserEmail(value) {
    return (value || '').toString().trim().toLowerCase();
}

function readStoredUsersList() {
    const raw = safeStorageGet('corriesells_users');
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function writeStoredUsersList(list) {
    if (!Array.isArray(list)) return;
    try {
        safeStorageSet('corriesells_users', JSON.stringify(list));
    } catch (e) {}
}

function syncUserWithStoredRecord(user) {
    if (!user) return user;
    const users = readStoredUsersList();
    if (!users.length) return user;
    const email = normalizeUserEmail(user.email);
    const index = users.findIndex((entry) => {
        if (!entry) return false;
        if (user.id && entry.id && entry.id === user.id) return true;
        if (email && entry.email) return normalizeUserEmail(entry.email) === email;
        return false;
    });
    if (index < 0) return user;
    const record = users[index] || {};
    const recordAvatar = record.avatarUrl || record.avatar || record.photoUrl || '';
    const userAvatar = user.avatarUrl || user.avatar || user.photoUrl || '';

    let merged = user;
    if (recordAvatar && !userAvatar) {
        merged = { ...record, ...user, avatarUrl: recordAvatar };
        try {
            safeStorageSet(STORAGE_USER, JSON.stringify(merged));
        } catch (e) {}
        try {
            setWindowNameData({ corriesells_user: merged });
        } catch (e) {}
    } else if (userAvatar && userAvatar !== recordAvatar) {
        users[index] = { ...record, avatarUrl: userAvatar };
        writeStoredUsersList(users);
    }

    return merged;
}

function getUserAvatarUrl(user) {
    return user && (user.avatarUrl || user.avatar || user.photoUrl)
        ? (user.avatarUrl || user.avatar || user.photoUrl)
        : '';
}

function updateHeaderAvatar(user) {
    const avatarUrl = getUserAvatarUrl(user);
    const buttons = document.querySelectorAll('.account-btn');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
        const img = btn.querySelector('.account-avatar-image');
        if (!img) return;
        if (avatarUrl) {
            img.src = avatarUrl;
            img.alt = 'Profile photo';
            btn.classList.add('has-image');
        } else {
            img.removeAttribute('src');
            img.alt = '';
            btn.classList.remove('has-image');
        }
    });
}

function isUserLoggedIn() {
    if (window.location.protocol === 'file:') return true;
    return !!readStoredUser();
}

function promptLoginForCheckout() {
    showNotification('Please log in or sign up to checkout.', 'info', 1800);
    const base = window.location.pathname.includes('/pages/') ? '' : 'pages/';
    stashCheckoutCart();
    setTimeout(() => {
        window.location.href = `${base}login.html?redirect=${encodeURIComponent(buildCheckoutRedirect())}`;
    }, 700);
}

function goToShopSearch(query) {
    const base = window.location.pathname.includes('/pages/') ? '' : 'pages/';
    const trimmed = (query || '').trim();
    const target = trimmed
        ? `${base}shop.html?q=${encodeURIComponent(trimmed)}`
        : `${base}shop.html`;
    window.location.href = target;
}

function initHeaderSearch() {
    const inputs = document.querySelectorAll('.search-bar input');
    if (!inputs.length) return;
    const isShopPage = !!document.getElementById('shopGrid');

    inputs.forEach((input) => {
        if (input.dataset.headerSearchBound === 'true') return;
        input.dataset.headerSearchBound = 'true';
        let debounceId;
        const isShopSearch = isShopPage && input.id === 'shopSearchInput';

        if (isShopSearch) {
            input.addEventListener('input', () => {
                clearTimeout(debounceId);
                debounceId = setTimeout(() => {
                    renderShopPage();
                }, 120);
            });
        }

        input.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            if (isShopSearch) renderShopPage();
            else goToShopSearch(input.value);
        });
    });

    document.querySelectorAll('.search-bar i').forEach((icon) => {
        icon.addEventListener('click', () => {
            const input = icon.parentElement ? icon.parentElement.querySelector('input') : null;
            if (isShopPage && input && input.id === 'shopSearchInput') {
                renderShopPage();
            } else {
                goToShopSearch(input ? input.value : '');
            }
        });
    });
}

async function subscribeNewsletter(e) {
    if (e) e.preventDefault();
    const target = e && e.target ? e.target : null;
    const form = target && target.tagName === 'FORM' ? target : target?.closest('form');
    const emailInput = form?.querySelector('input[type="email"]') || document.querySelector('.footer-newsletter input[type="email"]');
    const email = (emailInput?.value || '').trim();

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    const captchaOk = await verifyRecaptcha('newsletter');
    if (!captchaOk) return;

    const ok = await sendEmailJS({
        to_email: EMAILJS_CONFIG.toEmail,
        to_name: 'CORRIESELLS Support',
        from_email: email,
        reply_to: email,
        user_email: email,
        subscriber_email: email,
        from_name: 'Newsletter Subscriber',
        user_name: 'Newsletter Subscriber',
        subject: 'Newsletter Subscription',
        message: `New newsletter subscription: ${email}`,
        form_name: 'Newsletter',
        type: 'newsletter',
        source: window.location.pathname
    });

    if (ok) {
        showNotification('Thanks for subscribing!', 'success');
        if (emailInput) emailInput.value = '';
    }
}

async function submitContactForm(e) {
    if (e) e.preventDefault();
    const form = e?.target;
    if (!form) return;

    const name = form.querySelector('input[name="name"]')?.value?.trim() || '';
    const email = form.querySelector('input[name="email"]')?.value?.trim() || '';
    const subject = form.querySelector('input[name="subject"]')?.value?.trim() || 'Contact Form Submission';
    const message = form.querySelector('textarea[name="message"]')?.value?.trim() || '';
    const wantsNewsletter = !!form.querySelector('input[name="newsletter"]')?.checked;

    if (!name || !isValidEmail(email) || !message) {
        showNotification('Please fill out all required fields.', 'error');
        return;
    }

    const ok = await sendEmailJS({
        to_email: EMAILJS_CONFIG.toEmail,
        to_name: 'CORRIESELLS Support',
        from_email: email,
        reply_to: email,
        user_email: email,
        from_name: name,
        user_name: name,
        subject,
        message: `${message}\n\nNewsletter opt-in: ${wantsNewsletter ? 'Yes' : 'No'}`,
        form_name: 'Contact',
        type: 'contact',
        source: window.location.pathname
    });

    if (ok) {
        showNotification('Thank you! We\'ll get back to you soon.', 'success');
        form.reset();
    }
}

window.subscribeNewsletter = subscribeNewsletter;
window.submitContactForm = submitContactForm;

// ---------------------------
// Wishlist page renderer
// ---------------------------
function removeFromWishlist(productId) {
    if (!productId) return;
    const w = getWishlist();
    const idx = w.indexOf(productId);
    if (idx > -1) {
        w.splice(idx, 1);
        saveWishlist(w);
        try { updateWishlistIcons(); } catch (e) {}
        showNotification('Removed from wishlist', 'info');
    }
}

function renderWishlistPage() {
    const container = document.getElementById('wishlistGrid');
    if (!container) return;
    const wishlist = getWishlist();
    if (!wishlist || wishlist.length === 0) {
        container.innerHTML = '<p class="text-center text-muted" style="padding: var(--spacing-lg);">Your wishlist is empty.</p>';
        return;
    }

    container.innerHTML = '';
    wishlist.forEach(id => {
        const p = PRODUCTS_DB[id];
        if (!p) return;
        const displayName = formatDisplayName(p);
        const displayImage = getPrimaryProductImage(p);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image"><img src="${displayImage}" alt="${displayName}"></div>
            <div class="product-info">
                <h3 class="product-title">${displayName}</h3>
                <div class="product-price-group"><span class="product-price">$${(p.price||0).toFixed(2)}</span></div>
                <div class="product-actions"></div>
            </div>
        `;
        const actions = card.querySelector('.product-actions');
        // View button
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-primary btn-sm';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', ()=>{ goToProductId(id); });
        actions.appendChild(viewBtn);

        // Add to cart button
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-primary';
        addBtn.innerHTML = '<i class="fas fa-shopping-bag"></i> Add to Cart';
        addBtn.addEventListener('click', ()=>{
            addToCart(id, 1, {});
            // remove from wishlist after adding to cart
            removeFromWishlist(id);
            renderWishlistPage();
        });
        actions.appendChild(addBtn);

        // Remove button
        const remBtn = document.createElement('button');
        remBtn.className = 'btn btn-outline';
        remBtn.textContent = 'Remove';
        remBtn.addEventListener('click', ()=>{ removeFromWishlist(id); renderWishlistPage(); });
        actions.appendChild(remBtn);

        container.appendChild(card);
    });

    try { initProductImageLoaders(container); } catch (error) {}
}

// ---------------------------
// Init
// ---------------------------
document.addEventListener('DOMContentLoaded', ()=>{
    ensureCartUIElements();
    const existingUser = readStoredUser();
    if (existingUser) {
        setWindowNameData({ corriesells_user: existingUser });
    }
    updateHeaderAvatar(existingUser);
    // Basic bindings
    document.querySelectorAll('.cart-icon').forEach((icon) => {
        if (icon.dataset.cartBound === 'true') return;
        icon.dataset.cartBound = 'true';
        icon.addEventListener('click', (e)=>{ e.preventDefault(); goToCartPage(); });
    });
    const buyNowBtn = document.getElementById('buyNowBtn');
    if (buyNowBtn && !buyNowBtn.dataset.bound) {
        buyNowBtn.dataset.bound = 'true';
        buyNowBtn.addEventListener('click', (e)=>{ e.preventDefault(); handleBuyNow(); });
    }
    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn && !addBtn.dataset.bound) {
        addBtn.dataset.bound = 'true';
        addBtn.addEventListener('click', (e)=>{ e.preventDefault(); handleAddToCart(); });
    }
    if (cartSidebarClose && !cartSidebarClose.dataset.bound) {
        cartSidebarClose.dataset.bound = 'true';
        cartSidebarClose.addEventListener('click', closeCart);
    }
    // Delegate wishlist buttons
    document.addEventListener('click', (e)=>{
        const w = e.target.closest('[data-wishlist]');
        if (!w) return;

        // Some static pages still use inline onclick="addToWishlist(...)". Let that path handle the toggle
        // so we do not double-toggle (add + remove) and show duplicate notifications.
        const inline = w.getAttribute('onclick') || '';
        if (/addToWishlist\s*\(/i.test(inline)) return;

        e.preventDefault();
        toggleWishlist(w.getAttribute('data-wishlist'));
    });
    // Validate and render pages
    try { validateProductsDB(); } catch(e){}
    try { renderProductPage(); } catch(e){}
    try { initShopFilters(); } catch(e){}
    try { initWishlistDrawer(); } catch(e){}
    try { renderWishlistPage(); } catch(e){}
    try { initMobileNav(); } catch(e){}
    try { initMobileDrawers(); } catch(e){}
    try { updateWishlistIcons(); } catch(e){}
    try { initHeaderSearch(); } catch(e){}
    try { initEmailJS(); } catch(e){}
    try { initProductImageLoaders(document); } catch(e){}
    updateCartUI();
});

// Ensure inline handlers can access these functions even if scripts are deferred.
window.goToCheckout = goToCheckout;
window.startCheckout = startCheckout;
window.handleBuyNow = handleBuyNow;
window.handleAddToCart = handleAddToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.goToCartPage = goToCartPage;
window.readStoredUser = readStoredUser;
window.updateHeaderAvatar = updateHeaderAvatar;
window.showMessageDialog = showMessageDialog;
window.showConfirmDialog = showConfirmDialog;

// ---------------------------
// Shop renderer
// ---------------------------
function normalizeShopToken(value) {
    return (value || '').toString().trim().toLowerCase();
}

function normalizeShopCategoryValue(value) {
    const token = normalizeShopToken(value).replace(/[^a-z]/g, '');
    if (token === 'men' || token === 'mens') return 'mens';
    if (token === 'women' || token === 'womens') return 'womens';
    if (token === 'kid' || token === 'kids') return 'kids';
    if (token === 'accessory' || token === 'accessories') return 'accessories';
    if (token === 'beachwear' || token === 'beach') return 'beachwear';
    if (token === 'all' || token === 'allitems') return 'all';
    return token;
}

function getSelectedFilterValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map((input) => normalizeShopToken(input.value))
        .filter(Boolean);
}

function getSelectedColorFilters() {
    return Array.from(document.querySelectorAll('.shop-color-filter.active'))
        .map((button) => normalizeShopToken(button.dataset.color))
        .filter(Boolean);
}

function getCategoryTitle(token) {
    const normalized = normalizeShopCategoryValue(token);
    const titles = {
        mens: "Men's",
        womens: "Women's",
        kids: "Kids'",
        accessories: 'Accessories',
        beachwear: 'Beachwear'
    };
    return titles[normalized] || 'Filtered';
}

function getProductCategoryToken(product) {
    const category = normalizeShopToken(product && product.category);
    const name = normalizeShopToken(product && product.name);
    const description = normalizeShopToken(product && product.description);
    const text = `${category} ${name} ${description}`;

    if (/kids|kid|marvin|toddler/.test(text)) return 'kids';
    if (/women|womens|dress|skirt|midi|slip|floral/.test(text)) return 'womens';
    if (/accessor|cap|hat|belt|bag/.test(text)) return 'accessories';
    if (/beach|swim|resort/.test(text)) return 'beachwear';
    if (/men|mens|shirt|pants|chino|hoodie|jacket|short/.test(text)) return 'mens';
    return normalizeShopCategoryValue(category);
}

function getProductMaterialTokens(product) {
    const text = normalizeShopToken(`${product && product.name} ${product && product.description}`);
    const materials = [];

    if (/organic cotton|cotton/.test(text)) materials.push('organic-cotton');
    if (/linen/.test(text)) materials.push('linen');
    if (/silk/.test(text)) materials.push('silk');
    if (/wool/.test(text)) materials.push('wool');
    if (/recycled polyester|polyester/.test(text)) materials.push('recycled-polyester');

    return materials;
}

function mapColorFromCode(code) {
    const hex = normalizeShopToken(code).replace('#', '');
    if (!hex) return null;

    if (['000000', '111111', '222222', '333333', '2b3a67'].includes(hex)) return 'black';
    if (['ffffff', 'fff8f0', 'f5f5f5'].includes(hex)) return 'white';
    if (['e8dcc8', 'c3a87a', 'bdb3a0', 'f7e7d9'].includes(hex)) return 'beige';
    if (['00838f', '4a90e2', '2b6cb0'].includes(hex)) return 'teal';
    if (['d4af37'].includes(hex)) return 'gold';
    if (['f4c430'].includes(hex)) return 'yellow';

    return null;
}

function mapColorFromName(name) {
    const token = normalizeShopToken(name);
    if (!token) return null;

    if (/black|charcoal|navy/.test(token)) return 'black';
    if (/white|ivory/.test(token)) return 'white';
    if (/beige|khaki|stone|floral/.test(token)) return 'beige';
    if (/teal|blue/.test(token)) return 'teal';
    if (/gold/.test(token)) return 'gold';
    if (/yellow/.test(token)) return 'yellow';

    return null;
}

function getProductColorTokens(product) {
    const colorTokens = new Set();
    const colors = Array.isArray(product && product.colors) ? product.colors : [];

    colors.forEach((entry) => {
        if (!entry) return;

        const nameToken = mapColorFromName(entry.name || entry);
        const codeToken = mapColorFromCode(entry.code || '');
        if (nameToken) colorTokens.add(nameToken);
        if (codeToken) colorTokens.add(codeToken);
    });

    return Array.from(colorTokens);
}

function matchesPriceRange(priceValue, priceRange) {
    const price = Number(priceValue) || 0;
    if (priceRange === 'under-50') return price < 50;
    if (priceRange === '50-100') return price >= 50 && price <= 100;
    if (priceRange === '100-200') return price > 100 && price <= 200;
    if (priceRange === '200-plus') return price > 200;
    return true;
}

function parseProductIndex(productId) {
    const value = parseInt((productId || '').split('-')[1], 10);
    return Number.isFinite(value) ? value : 0;
}

function sortShopProducts(products, sortValue) {
    const list = [...products];
    const token = normalizeShopToken(sortValue);

    if (token === 'price-asc') {
        return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    if (token === 'price-desc') {
        return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    if (token === 'name-asc') {
        return list.sort((a, b) => formatDisplayName(a).localeCompare(formatDisplayName(b)));
    }

    if (token === 'name-desc') {
        return list.sort((a, b) => formatDisplayName(b).localeCompare(formatDisplayName(a)));
    }

    // Default newest: higher product index first.
    return list.sort((a, b) => parseProductIndex(b.id) - parseProductIndex(a.id));
}

function updateShopSummary(filteredCount, totalCount, categories) {
    const titleEl = document.getElementById('shopResultsTitle');
    const countEl = document.getElementById('shopResultsCount');

    if (titleEl) {
        if (categories.length === 1) titleEl.textContent = `${getCategoryTitle(categories[0])} Products`;
        else if (categories.length > 1) titleEl.textContent = 'Filtered Products';
        else titleEl.textContent = 'All Products';
    }

    if (countEl) {
        countEl.textContent = `Showing ${filteredCount} of ${totalCount} items`;
    }
}

function syncCategorySelection(changedInput) {
    const allInput = document.querySelector('input[name="category"][value="all"]');
    const others = Array.from(document.querySelectorAll('input[name="category"]'))
        .filter((input) => input.value !== 'all');

    if (!allInput) return;

    if (changedInput && changedInput.value === 'all' && allInput.checked) {
        others.forEach((input) => { input.checked = false; });
    }

    if (changedInput && changedInput.value !== 'all' && changedInput.checked) {
        allInput.checked = false;
    }

    const anyOtherChecked = others.some((input) => input.checked);
    if (!allInput.checked && !anyOtherChecked) {
        allInput.checked = true;
    }
}

function getURLParamValues(params, key) {
    const entries = params.getAll(key);
    if (!entries.length) return [];

    return entries
        .flatMap((entry) => normalizeShopToken(entry).split(','))
        .map((entry) => normalizeShopToken(entry))
        .filter(Boolean);
}

function setCheckedInputsFromValues(name, values) {
    const valueSet = new Set(values.map((value) => normalizeShopToken(value)));
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
        input.checked = valueSet.has(normalizeShopToken(input.value));
    });
}

function setActiveColorButtonsFromValues(values) {
    const valueSet = new Set(values.map((value) => normalizeShopToken(value)));
    document.querySelectorAll('.shop-color-filter').forEach((button) => {
        const isActive = valueSet.has(normalizeShopToken(button.dataset.color));
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}

function applyInitialShopFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);

    const categoryValues = getURLParamValues(params, 'category').map(normalizeShopCategoryValue);
    const activeCategories = categoryValues.filter((value) => value && value !== 'all');
    const allCategoryInput = document.querySelector('input[name="category"][value="all"]');
    const categoryInputs = Array.from(document.querySelectorAll('input[name="category"]'))
        .filter((input) => input.value !== 'all');

    if (categoryInputs.length) {
        categoryInputs.forEach((input) => {
            const token = normalizeShopCategoryValue(input.value);
            input.checked = activeCategories.includes(token);
        });

        if (allCategoryInput) {
            allCategoryInput.checked = activeCategories.length === 0;
            syncCategorySelection(allCategoryInput.checked ? allCategoryInput : categoryInputs.find((input) => input.checked));
        }
    }

    setCheckedInputsFromValues('price', getURLParamValues(params, 'price'));
    setCheckedInputsFromValues('size', getURLParamValues(params, 'size').map((value) => value.toUpperCase()));
    setCheckedInputsFromValues('material', getURLParamValues(params, 'material'));
    setActiveColorButtonsFromValues(getURLParamValues(params, 'color'));

    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) searchInput.value = params.get('q') || '';

    const sortSelect = document.getElementById('shopSortSelect');
    if (sortSelect) {
        const sortValue = normalizeShopToken(params.get('sort') || 'newest');
        const hasOption = Array.from(sortSelect.options).some((option) => option.value === sortValue);
        sortSelect.value = hasOption ? sortValue : 'newest';
    }
}

function syncShopURLState(state) {
    const params = new URLSearchParams(window.location.search);
    ['category', 'price', 'size', 'material', 'color', 'q', 'sort'].forEach((key) => params.delete(key));

    state.activeCategories.forEach((value) => params.append('category', value));
    state.selectedPriceRanges.forEach((value) => params.append('price', value));
    state.selectedSizeTokens.forEach((value) => params.append('size', normalizeShopToken(value)));
    state.selectedMaterials.forEach((value) => params.append('material', value));
    state.selectedColors.forEach((value) => params.append('color', value));

    if (state.searchTerm) params.set('q', state.searchTerm);
    if (state.sortValue && state.sortValue !== 'newest') params.set('sort', state.sortValue);

    const query = params.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, '', nextUrl);
}

function clearShopFilters() {
    const allInput = document.querySelector('input[name="category"][value="all"]');

    document.querySelectorAll('input[name="category"]').forEach((input) => {
        input.checked = input.value === 'all';
    });
    document.querySelectorAll('input[name="price"], input[name="size"], input[name="material"]').forEach((input) => {
        input.checked = false;
    });
    document.querySelectorAll('.shop-color-filter').forEach((button) => {
        button.classList.remove('active');
        button.setAttribute('aria-pressed', 'false');
    });

    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('shopSortSelect');
    if (sortSelect) sortSelect.value = 'newest';

    if (allInput) syncCategorySelection(allInput);
}

function renderShopPage() {
    const grid = document.getElementById('shopGrid');
    if (!grid) return;

    const allProducts = Object.values(PRODUCTS_DB);

    const selectedCategories = getSelectedFilterValues('category').map(normalizeShopCategoryValue);
    const activeCategories = selectedCategories.filter((category) => category && category !== 'all');

    const selectedPriceRanges = getSelectedFilterValues('price');
    const selectedSizeTokens = getSelectedFilterValues('size');
    const selectedSizes = selectedSizeTokens.map((size) => size.toUpperCase());
    const selectedMaterials = getSelectedFilterValues('material');
    const selectedColors = getSelectedColorFilters();
    const searchInput = document.getElementById('shopSearchInput');
    const searchTerm = normalizeShopToken(searchInput ? searchInput.value : '');
    const sortSelect = document.getElementById('shopSortSelect');
    const sortValue = sortSelect ? sortSelect.value : 'newest';

    let products = [...allProducts];

    if (activeCategories.length > 0) {
        products = products.filter((product) => activeCategories.includes(getProductCategoryToken(product)));
    }

    if (selectedPriceRanges.length > 0) {
        products = products.filter((product) => selectedPriceRanges.some((range) => matchesPriceRange(product.price, range)));
    }

    if (selectedSizes.length > 0) {
        products = products.filter((product) => {
            const productSizes = Array.isArray(product.sizes) ? product.sizes.map((size) => normalizeShopToken(size).toUpperCase()) : [];
            return selectedSizes.some((size) => productSizes.includes(size));
        });
    }

    if (selectedMaterials.length > 0) {
        products = products.filter((product) => {
            const productMaterials = getProductMaterialTokens(product);
            return selectedMaterials.some((material) => productMaterials.includes(material));
        });
    }

    if (selectedColors.length > 0) {
        products = products.filter((product) => {
            const productColors = getProductColorTokens(product);
            return selectedColors.some((color) => productColors.includes(color));
        });
    }

    if (searchTerm) {
        products = products.filter((product) => {
            const searchable = normalizeShopToken(`${formatDisplayName(product)} ${product.category} ${product.description}`);
            return searchable.includes(searchTerm);
        });
    }

    products = sortShopProducts(products, sortValue);
    updateShopSummary(products.length, allProducts.length, activeCategories);
    syncShopURLState({
        activeCategories,
        selectedPriceRanges,
        selectedSizeTokens,
        selectedMaterials,
        selectedColors,
        searchTerm,
        sortValue
    });

    if (!products.length) {
        grid.innerHTML = '<p class="text-center text-muted">No products match your filters. Try clearing one or more filters.</p>';
        return;
    }

    grid.innerHTML = products.map((product) => {
        const displayName = formatDisplayName(product);
        const category = formatCategoryLabel(product.category);
        const img = getPrimaryProductImage(product);
        return `
            <div class="product-card">
                <div class="product-image"><img src="${img}" alt="${displayName}"></div>
                <div class="product-info">
                    <div class="product-category">${category}</div>
                    <h3 class="product-title">${displayName}</h3>
                    <div class="product-price-group"><span class="product-price">$${(product.price || 0).toFixed(2)}</span></div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm" onclick="goToProductId('${product.id}')">View Details</button>
                        <button class="btn btn-primary btn-sm" onclick="addToCart('${product.id}')">Add to Cart</button>
                        <button class="btn btn-outline btn-sm" data-wishlist="${product.id}" aria-label="Add ${displayName} to wishlist"><i class="far fa-heart"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    try { initProductImageLoaders(grid); } catch (error) {}
    try { updateWishlistIcons(); } catch (error) {}
}

function initShopFilters() {
    const grid = document.getElementById('shopGrid');
    if (!grid || grid.dataset.shopFiltersBound === 'true') return;
    grid.dataset.shopFiltersBound = 'true';

    applyInitialShopFiltersFromURL();

    const categoryInputs = document.querySelectorAll('input[name="category"]');
    categoryInputs.forEach((input) => {
        input.addEventListener('change', () => {
            syncCategorySelection(input);
            renderShopPage();
        });
    });

    document.querySelectorAll('input[name="price"], input[name="size"], input[name="material"]').forEach((input) => {
        input.addEventListener('change', renderShopPage);
    });

    document.querySelectorAll('.shop-color-filter').forEach((button) => {
        button.addEventListener('click', () => {
            const nextState = !button.classList.contains('active');
            button.classList.toggle('active', nextState);
            button.setAttribute('aria-pressed', nextState ? 'true' : 'false');
            renderShopPage();
        });
    });

    const applyButton = document.getElementById('applyShopFiltersBtn');
    if (applyButton) applyButton.addEventListener('click', renderShopPage);

    const clearButton = document.getElementById('clearShopFiltersBtn');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            clearShopFilters();
            renderShopPage();
        });
    }

    const sortSelect = document.getElementById('shopSortSelect');
    if (sortSelect) sortSelect.addEventListener('change', renderShopPage);

    window.addEventListener('popstate', () => {
        applyInitialShopFiltersFromURL();
        renderShopPage();
    });

    renderShopPage();
}

function initWishlistDrawer() {
    const triggers = Array.from(document.querySelectorAll('[data-drawer-toggle="wishlist"]'));
    if (!triggers.length) return;

    const isWishlistPage = window.location.pathname.toLowerCase().includes('wishlist');
    let drawer = document.querySelector('[data-drawer="wishlist"]');
    if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'wishlistDrawer';
        drawer.className = 'mobile-drawer drawer-right wishlist-drawer';
        drawer.dataset.drawer = 'wishlist';
        drawer.dataset.drawerBreakpoint = '900';
        drawer.innerHTML = `
            <div class="drawer-header">
                <h2 style="margin: 0;">Wishlist</h2>
                <button class="drawer-close" type="button" data-drawer-close="wishlist" aria-label="Close wishlist">&times;</button>
            </div>
            <div id="wishlistGrid" class="grid grid-3"></div>
        `;
        document.body.appendChild(drawer);
    } else {
        drawer.dataset.drawer = 'wishlist';
        drawer.dataset.drawerBreakpoint = drawer.dataset.drawerBreakpoint || '900';
        drawer.classList.add('mobile-drawer', 'drawer-right');
        if (!isWishlistPage) drawer.classList.add('wishlist-drawer');
    }

    if (!drawer.id) drawer.id = 'wishlistDrawer';

    let backdrop = document.querySelector('[data-drawer-backdrop="wishlist"]');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'drawer-backdrop';
        backdrop.dataset.drawerBackdrop = 'wishlist';
        document.body.insertBefore(backdrop, document.body.firstChild);
    }

    triggers.forEach((trigger) => {
        const fallback = trigger.getAttribute('data-drawer-fallback')
            || trigger.getAttribute('href')
            || 'wishlist.html';

        trigger.removeAttribute('onclick');
        trigger.dataset.drawerToggle = 'wishlist';
        trigger.dataset.drawerFallback = fallback;
        trigger.setAttribute('aria-controls', drawer.id);
        trigger.setAttribute('aria-expanded', 'false');
    });
}

function initMobileDrawers() {
    const drawers = Array.from(document.querySelectorAll('[data-drawer]'));
    if (!drawers.length) return;

    const updateBodyLock = () => {
        const anyOpen = drawers.some((drawer) => drawer.classList.contains('is-open'));
        document.body.classList.toggle('drawer-open', anyOpen);
    };

    const setDrawerState = (drawer, open) => {
        const id = drawer.dataset.drawer;
        const breakpoint = Number.parseInt(drawer.dataset.drawerBreakpoint || '900', 10);
        drawer.classList.toggle('is-open', open);
        if (id === 'nav') {
            document.body.classList.toggle('nav-drawer-open', open);
        }
        document.querySelectorAll(`[data-drawer-toggle="${id}"]`).forEach((toggle) => {
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        const backdrop = document.querySelector(`[data-drawer-backdrop="${id}"]`);
        if (backdrop) backdrop.classList.toggle('active', open);

        if (window.matchMedia(`(max-width: ${breakpoint}px)`).matches) {
            drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
        } else {
            drawer.removeAttribute('aria-hidden');
        }

        updateBodyLock();
    };

    const closeAllDrawers = () => {
        drawers.forEach((drawer) => {
            if (drawer.classList.contains('is-open')) setDrawerState(drawer, false);
        });
    };

    drawers.forEach((drawer) => {
        if (drawer.dataset.drawerBound === 'true') return;
        drawer.dataset.drawerBound = 'true';

        const id = drawer.dataset.drawer;
        const toggles = document.querySelectorAll(`[data-drawer-toggle="${id}"]`);
        const closeButtons = document.querySelectorAll(`[data-drawer-close="${id}"]`);
        const backdrop = document.querySelector(`[data-drawer-backdrop="${id}"]`);

        toggles.forEach((toggle) => {
            if (toggle.dataset.drawerToggleBound === 'true') return;
            toggle.dataset.drawerToggleBound = 'true';
            toggle.addEventListener('click', (event) => {
                event.preventDefault();
                const breakpoint = Number.parseInt(drawer.dataset.drawerBreakpoint || '900', 10);
                if (!window.matchMedia(`(max-width: ${breakpoint}px)`).matches) {
                    const fallback = toggle.dataset.drawerFallback;
                    if (fallback) window.location.href = fallback;
                    return;
                }
                const nextState = !drawer.classList.contains('is-open');
                setDrawerState(drawer, nextState);
            });
        });

        closeButtons.forEach((btn) => {
            if (btn.dataset.drawerCloseBound === 'true') return;
            btn.dataset.drawerCloseBound = 'true';
            btn.addEventListener('click', () => setDrawerState(drawer, false));
        });

        if (backdrop && backdrop.dataset.drawerBackdropBound !== 'true') {
            backdrop.dataset.drawerBackdropBound = 'true';
            backdrop.addEventListener('click', () => setDrawerState(drawer, false));
        }

        const handleResize = () => {
            const breakpoint = Number.parseInt(drawer.dataset.drawerBreakpoint || '900', 10);
            if (!window.matchMedia(`(max-width: ${breakpoint}px)`).matches) {
                setDrawerState(drawer, false);
            } else if (!drawer.classList.contains('is-open')) {
                drawer.setAttribute('aria-hidden', 'true');
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
    });

    if (document.body.dataset.drawerEscBound !== 'true') {
        document.body.dataset.drawerEscBound = 'true';
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeAllDrawers();
        });
    }
}

function initMobileNav() {
    const toggles = Array.from(document.querySelectorAll('.mobile-menu-toggle'));
    if (!toggles.length) return;

    toggles.forEach((toggle, index) => {
        if (toggle.dataset.navBound === 'true') return;
        toggle.dataset.navBound = 'true';

        const header = toggle.closest('header');
        const nav = header ? header.querySelector('nav') : document.querySelector('nav');
        if (!nav) return;

        if (!nav.dataset.drawer) {
            nav.dataset.drawer = 'nav';
            nav.dataset.drawerBreakpoint = '768';
            nav.classList.add('mobile-drawer', 'drawer-right', 'nav-drawer');
        }

        if (!nav.id) {
            nav.id = `siteNav${index || ''}`;
        }

        toggle.setAttribute('aria-controls', nav.id);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.dataset.drawerToggle = nav.dataset.drawer;

        let backdrop = document.querySelector(`[data-drawer-backdrop="${nav.dataset.drawer}"]`);
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'drawer-backdrop';
            backdrop.dataset.drawerBackdrop = nav.dataset.drawer;
            if (header) {
                // Keep nav drawer + backdrop in the same stacking context so
                // backdrop doesn't block clicks on nav links.
                header.appendChild(backdrop);
            } else {
                document.body.insertBefore(backdrop, document.body.firstChild);
            }
        }

        const existingHeader = nav.querySelector('.drawer-header');
        if (!existingHeader) {
            const drawerHeader = document.createElement('div');
            drawerHeader.className = 'drawer-header';
            drawerHeader.innerHTML = `
                <h3 style="margin: 0;">Menu</h3>
                <button class="drawer-close" type="button" data-drawer-close="${nav.dataset.drawer}" aria-label="Close menu">&times;</button>
            `;
            nav.insertBefore(drawerHeader, nav.firstChild);
        }

        nav.querySelectorAll('a').forEach((link) => {
            if (link.parentElement && link.parentElement.classList.contains('dropdown')) return;
            if (!link.dataset.drawerClose) link.dataset.drawerClose = nav.dataset.drawer;
            if (link.dataset.mobileNavLinkBound === 'true') return;
            link.dataset.mobileNavLinkBound = 'true';
            link.addEventListener('click', (event) => {
                if (!window.matchMedia('(max-width: 768px)').matches) return;
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

                // Force reliable navigation from the mobile drawer even if another
                // script/layout layer interferes with the default anchor behavior.
                const href = link.getAttribute('href');
                if (!href || href.trim() === '#') return;
                event.preventDefault();
                window.location.href = link.href;
            });
        });

        nav.querySelectorAll('.dropdown > a').forEach((link) => {
            if (link.dataset.dropdownBound === 'true') return;
            link.dataset.dropdownBound = 'true';
            link.addEventListener('click', (event) => {
                if (!window.matchMedia('(max-width: 768px)').matches) return;
                event.preventDefault();
                const dropdown = link.closest('.dropdown');
                dropdown.classList.toggle('open');
            });
        });
    });
}

// Export for tests / node if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { addToCart, removeFromCart, updateCartItem, getCart, saveCart };
}
