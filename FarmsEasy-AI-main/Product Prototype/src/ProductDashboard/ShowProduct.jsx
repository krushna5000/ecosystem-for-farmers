import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, CheckCircle, Package, FileText, Briefcase, FlaskConical, Star, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import './dashboard.css';
import EditProductPopup from './EditProductPopup';

const ProductImageCarousel = ({ images, productName }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) {
        return (
            <div className="card-image-container">
                <Package size={64} color="#9ca3af" opacity={0.5} />
            </div>
        );
    }

    return (
        <div className="card-image-container carousel-container">
            <img
                src={images[currentImageIndex]}
                alt={`${productName} - ${currentImageIndex + 1}`}
                className="card-product-image"
            />

            {images.length > 1 && (
                <>
                    <button className="carousel-btn prev" onClick={prevImage}>
                        <ChevronLeft size={16} />
                    </button>
                    <button className="carousel-btn next" onClick={nextImage}>
                        <ChevronRight size={16} />
                    </button>
                    <div className="carousel-dots">
                        {images.map((_, idx) => (
                            <span
                                key={idx}
                                className={`carousel-dot ${idx === currentImageIndex ? 'active' : ''}`}
                            ></span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const ShowProduct = () => {
    const [products, setProducts] = useState([]);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // Edit Modal State
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
        setProducts(storedProducts);
    }, []);

    const confirmDelete = (id) => {
        setProductToDelete(id);
        setShowDeletePopup(true);
    };

    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

    const executeDelete = () => {
        if (productToDelete) {
            const updatedProducts = products.filter(p => p.id !== productToDelete);
            setProducts(updatedProducts);
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            setShowDeletePopup(false);
            setProductToDelete(null);
            setShowDeleteSuccess(true);
        }
    };

    const cancelDelete = () => {
        setShowDeletePopup(false);
        setProductToDelete(null);
    };

    // Edit Logic
    const handleEditClick = (product) => {
        setProductToEdit(product);
        setShowEditPopup(true);
    };

    const handleUpdateProduct = (updatedProduct) => {
        const updatedProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        setProducts(updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        setShowEditPopup(false);
        setProductToEdit(null);
    };

    const cancelEdit = () => {
        setShowEditPopup(false);
        setProductToEdit(null);
    };

    return (
        <div className="product-detail-container">
            <div className="product-header">
                <h2>Products</h2>
            </div>

            <div className="product-grid">
                {products.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#6b7280', background: 'white', borderRadius: '8px' }}>
                        <Package size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>No products found.</p>
                        <p style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>Start by adding your first product.</p>
                        <Link to="/add-product" className="btn-add-product" style={{ display: 'inline-flex' }}>
                            + Add Product
                        </Link>
                    </div>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className="product-card"
                        >
                            {/* Image Section - Now using Carousel */}
                            <ProductImageCarousel
                                images={product.images}
                                productName={product.productName || 'Product'}
                            />

                            {/* Content Section */}
                            <div className="card-content">
                                <h3 className="card-title">{product.productName || 'Product Name'}</h3>

                                {/* Category Pill */}
                                <div className="category-pill">
                                    {product.categoryId || 'CATEGORY'}
                                </div>

                                {/* Info Rows */}
                                <div className="card-details">
                                    <div className="detail-row">
                                        <div className="detail-icon"><FileText size={16} /></div>
                                        <div className="detail-text">
                                            <span className="label">Brand ID:</span>
                                            <span className="value">{product.brandId || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <div className="detail-icon"><Briefcase size={16} /></div>
                                        <div className="detail-text">
                                            <span className="label">Company:</span>
                                            <span className="value">{product.companyName || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <div className="detail-icon"><Tag size={16} /></div>
                                        <div className="detail-text">
                                            <span className="label">Price:</span>
                                            <span className="value" style={{ color: '#16a34a', fontWeight: 'bold' }}>
                                                {product.price ? `₹${product.price} ` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="divider"></div>

                                {/* Footer Stats */}
                                <div className="card-stats">
                                    <div className="stat-item">
                                        <div className="stat-icon"><FlaskConical size={18} /></div>
                                        <div className="stat-info">
                                            <span className="stat-label">COMPOSITION</span>
                                            <span className="stat-value" title={product.composition}>{product.composition || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="stat-item right-align">
                                        <div className="star-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < (product.rank || 0) ? "star-filled" : "star-empty"}
                                                    fill={i < (product.rank || 0) ? "#fbbf24" : "none"}
                                                    color={i < (product.rank || 0) ? "#fbbf24" : "#d1d5db"}
                                                />
                                            ))}
                                            <span className="rank-number">{product.rank || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="card-actions-bottom">
                                <button
                                    className="bottom-btn btn-edit-large"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(product);
                                    }}
                                >
                                    <Edit size={16} /> Edit
                                </button>
                                <button
                                    className="bottom-btn btn-delete-large"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDelete(product.id);
                                    }}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Custom Delete Confirmation Popup */}
            {showDeletePopup && (
                <div className="popup-overlay">
                    <div className="popup-content" style={{ width: '400px' }}>
                        <div className="popup-icon-container" style={{ backgroundColor: '#fee2e2' }}>
                            <Trash2 size={48} color="#ef4444" />
                        </div>
                        <h3 className="popup-title">Delete Product?</h3>
                        <p className="popup-message">Are you sure you want to delete this product? This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn-cancel" onClick={cancelDelete} style={{ padding: '0.75rem 0', flex: 1 }}>Cancel</button>
                            <button className="popup-btn" onClick={executeDelete} style={{ backgroundColor: '#ef4444', flex: 1 }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Delete Popup */}
            {showDeleteSuccess && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <div className="popup-icon-container">
                            <CheckCircle size={48} color="#10b981" />
                        </div>
                        <h3 className="popup-title">Success!</h3>
                        <p className="popup-message">Product Deleted Successfully</p>
                        <button className="popup-btn" onClick={() => setShowDeleteSuccess(false)}>OK</button>
                    </div>
                </div>
            )}

            {/* Edit Product Popup */}
            {showEditPopup && productToEdit && (
                <EditProductPopup
                    product={productToEdit}
                    onClose={cancelEdit}
                    onUpdate={handleUpdateProduct}
                />
            )}
        </div>
    );
};

export default ShowProduct;