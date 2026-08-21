import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './dashboard.css';
import { Upload, X, Plus, CheckCircle } from 'lucide-react';

const AddProduct = () => {
    const [images, setImages] = useState([]);
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        brandId: '',
        categoryId: '',
        productName: '',
        price: '',
        composition: '',
        disease: '',
        description: '',
        methodUseCase: '',
        useCase: '',
        companyName: '',
        rank: ''
    });

    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, {
                    url: reader.result,
                    file: file
                }]);
            };
            reader.readAsDataURL(file);
        });

        if (errors.images) {
            setErrors(prev => ({ ...prev, images: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.brandId) newErrors.brandId = 'Brand ID is required';
        if (!formData.categoryId) newErrors.categoryId = 'Category ID is required';
        if (!formData.companyName) newErrors.companyName = 'Company Name is required';
        if (!formData.productName) newErrors.productName = 'Product Name is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.composition) newErrors.composition = 'Composition is required';
        if (!formData.rank) newErrors.rank = 'Rank is required';

        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
            newErrors.price = 'Price must be a valid positive number';
        }

        if (!formData.disease) newErrors.disease = 'Disease is required';
        if (!formData.methodUseCase) newErrors.methodUseCase = 'Method is required';
        if (!formData.useCase) newErrors.useCase = 'Use Case is required';

        if (images.length === 0) {
            newErrors.images = 'At least one product image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCancel = () => {
        setFormData({
            brandId: '',
            categoryId: '',
            productName: '',
            price: '',
            composition: '',
            disease: '',
            description: '',
            methodUseCase: '',
            useCase: '',
            companyName: '',
            rank: ''
        });
        setImages([]);
        setErrors({});
    };

    const handleClosePopup = () => {
        setShowSuccess(false);
        handleCancel(); // Reset form
        navigate('/products');
    };

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Form Data:', formData);
            console.log('Images:', images);

            // Save to LocalStorage
            const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
            const newProduct = { ...formData, images: images.map(img => img.url), id: Date.now() }; // Save image URLs
            const updatedProducts = [...existingProducts, newProduct];
            localStorage.setItem('products', JSON.stringify(updatedProducts));

            // Show Success Popup instead of alert
            setShowSuccess(true);
        }
    };

    const InputError = ({ name }) => {
        return errors[name] ? <span className="error-message">{errors[name]}</span> : null;
    };

    return (
        <div className="product-detail-container">
            <div className="form-container">
                <h2 className="form-title">{isEditMode ? 'Product Details' : 'Add Product Details'}</h2>
                <form onSubmit={handleSubmit} className="sectioned-form">

                    {/* Identifiers Section */}
                    <div className="form-section">
                        <div className="section-header">Identifiers</div>
                        <div className="section-body">
                            <div className="form-group horizontal">
                                <label className="form-label">Brand ID:</label>
                                <div className="input-wrapper">
                                    <input type="text" name="brandId" className={`form-input ${errors.brandId ? 'error' : ''}`} value={formData.brandId} onChange={handleInputChange} />
                                    <InputError name="brandId" />
                                </div>
                            </div>
                            <div className="form-group horizontal">
                                <label className="form-label">Category ID:</label>
                                <div className="input-wrapper">
                                    <input type="text" name="categoryId" className={`form-input ${errors.categoryId ? 'error' : ''}`} value={formData.categoryId} onChange={handleInputChange} />
                                    <InputError name="categoryId" />
                                </div>
                            </div>
                            <div className="form-group horizontal">
                                <label className="form-label">Company Name:</label>
                                <div className="input-wrapper">
                                    <input type="text" name="companyName" className={`form-input ${errors.companyName ? 'error' : ''}`} value={formData.companyName} onChange={handleInputChange} />
                                    <InputError name="companyName" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="form-section">
                        <div className="section-header">Product Details</div>
                        <div className="section-body">
                            <div className="form-group horizontal">
                                <label className="form-label">Product Name:</label>
                                <div className="input-wrapper">
                                    <input type="text" name="productName" className={`form-input ${errors.productName ? 'error' : ''}`} value={formData.productName} onChange={handleInputChange} />
                                    <InputError name="productName" />
                                </div>
                            </div>

                            <div className="form-group horizontal top-align">
                                <label className="form-label">Description:</label>
                                <div className="input-wrapper">
                                    <textarea name="description" className={`form-textarea ${errors.description ? 'error' : ''}`} value={formData.description} onChange={handleInputChange} />
                                    <InputError name="description" />
                                </div>
                            </div>
                            <div className="form-group horizontal">
                                <label className="form-label">Composition:</label>
                                <div className="input-wrapper">
                                    <input type="text" name="composition" className={`form-input ${errors.composition ? 'error' : ''}`} value={formData.composition} onChange={handleInputChange} />
                                    <InputError name="composition" />
                                </div>
                            </div>
                            <div className="form-group horizontal">
                                <label className="form-label">Rank:</label>
                                <div className="input-wrapper">
                                    <input type="number" name="rank" className={`form-input ${errors.rank ? 'error' : ''}`} value={formData.rank} onChange={handleInputChange} />
                                    <InputError name="rank" />
                                </div>
                            </div>
                            {/* Product Images Section */}
                            <div className="form-group vertical">
                                <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Product Images</label>

                                <div className="image-upload-container">
                                    <input
                                        id="fileInput"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />

                                    <div className="image-preview-grid">
                                        {images.map((img, index) => (
                                            <div key={index} className="preview-card">
                                                <img src={img.url} alt="Preview" className="preview-image" />
                                                <button type="button" className="remove-image-btn" onClick={() => {
                                                    setImages(images.filter((_, i) => i !== index));
                                                }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add More Tile */}
                                        <div className="add-more-tile" style={errors.images ? { borderColor: 'red' } : {}} onClick={() => document.getElementById('fileInput').click()}>
                                            <Plus size={24} color="#9ca3af" />
                                        </div>
                                    </div>
                                    <InputError name="images" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Commercial Information Section */}
                    <div className="form-section">
                        <div className="section-header">Commercial Information</div>
                        <div className="section-body">
                            <div className="form-group horizontal">
                                <label className="form-label">Price:</label>
                                <div className="input-wrapper">
                                    <input type="number" name="price" className={`form-input ${errors.price ? 'error' : ''}`} value={formData.price} onChange={handleInputChange} />
                                    <InputError name="price" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Usage / Medical Info Section */}
                    <div className="form-section">
                        <div className="section-header">Usage / Medical Info</div>
                        <div className="section-body">
                            <div className="form-group horizontal">
                                <label className="form-label">Disease:</label>
                                <div className="input-wrapper">
                                    <input type="text" name="disease" className={`form-input ${errors.disease ? 'error' : ''}`} value={formData.disease} onChange={handleInputChange} />
                                    <InputError name="disease" />
                                </div>
                            </div>
                            <div className="form-group horizontal">
                                <label className="form-label">Method:</label>
                                <div className="input-wrapper">
                                    <input type="text" name="methodUseCase" className={`form-input ${errors.methodUseCase ? 'error' : ''}`} placeholder="Method of use" value={formData.methodUseCase} onChange={handleInputChange} />
                                    <InputError name="methodUseCase" />
                                </div>
                            </div>
                            <div className="form-group horizontal">
                                <label className="form-label">Use Case:</label>
                                <div className="input-wrapper">
                                    <input type="text" name="useCase" className={`form-input ${errors.useCase ? 'error' : ''}`} placeholder="Specific use case" value={formData.useCase} onChange={handleInputChange} />
                                    <InputError name="useCase" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions-center">
                        <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="btn-submit-blue">Submit</button>
                    </div>

                </form>
            </div>

            {/* Success Popup */}
            {showSuccess && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <div className="popup-icon-container">
                            <CheckCircle size={48} color="#10b981" />
                        </div>
                        <h3 className="popup-title">Success!</h3>
                        <p className="popup-message">Product {isEditMode ? 'Updated' : 'Added'} Successfully</p>
                        <button className="popup-btn" onClick={handleClosePopup}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddProduct;
