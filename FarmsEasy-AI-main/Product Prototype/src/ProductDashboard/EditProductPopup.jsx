import React, { useState, useEffect } from 'react';
import { Upload, X, Plus, CheckCircle } from 'lucide-react';
import './dashboard.css';

const EditProductPopup = ({ product, onClose, onUpdate }) => {
    const [images, setImages] = useState([]);
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

    useEffect(() => {
        if (product) {
            setFormData({
                brandId: product.brandId || '',
                categoryId: product.categoryId || '',
                productName: product.productName || '',
                price: product.price || '',
                composition: product.composition || '',
                disease: product.disease || '',
                description: product.description || '',
                methodUseCase: product.methodUseCase || '',
                useCase: product.useCase || '',
                companyName: product.companyName || '',
                rank: product.rank || ''
            });

            if (product.images && product.images.length > 0) {
                setImages(product.images.map(url => ({ url })));
            }
        }
    }, [product]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                    url: reader.result
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

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setShowSuccess(true);
        }
    };

    const handleCloseSuccess = () => {
        const updatedProduct = {
            ...product,
            ...formData,
            images: images.map(img => img.url)
        };
        onUpdate(updatedProduct);
        setShowSuccess(false);
    };

    const InputError = ({ name }) => {
        return errors[name] ? <span className="error-message">{errors[name]}</span> : null;
    };

    if (showSuccess) {
        return (
            <div className="popup-overlay">
                <div className="popup-content">
                    <div className="popup-icon-container">
                        <CheckCircle size={48} color="#10b981" />
                    </div>
                    <h3 className="popup-title">Success!</h3>
                    <p className="popup-message">Product Updated Successfully</p>
                    <button className="popup-btn" onClick={handleCloseSuccess}>OK</button>
                </div>
            </div>
        );
    }

    return (
        <div className="popup-overlay" style={{ alignItems: 'flex-start', overflowY: 'auto', padding: '2rem 0' }}>
            <div className="popup-content" style={{ width: '800px', maxWidth: '95%', textAlign: 'left', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Edit Product</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '2rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
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

                                <div className="form-group vertical">
                                    <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Product Images</label>
                                    <div className="image-upload-container">
                                        <input
                                            id="editFileInput"
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
                                            <div className="add-more-tile" style={errors.images ? { borderColor: 'red' } : {}} onClick={() => document.getElementById('editFileInput').click()}>
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

                        <div className="form-actions-center" style={{ marginTop: '2rem', paddingBottom: '1rem' }}>
                            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-submit-blue">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProductPopup;
