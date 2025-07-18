# DELIGHT Digital Consent Management System

A modern, accessible digital consent management system for medical research studies, built with Material Design 3 principles and featuring a responsive design with light/dark theme support.

## 🌟 Features

### **Multi-Step Consent Process**
- **5-Step Workflow**: Welcome → Information → Consent Questions → Digital Signatures → Completion
- **Progress Tracking**: Visual progress bar with step indicators
- **Form Validation**: Comprehensive validation with error handling

### **Modern UI/UX**
- **Material Design 3**: Following Google's latest design system
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Theme Toggle**: Switch between light and dark modes with smooth animations
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

### **Digital Signature Capture**
- **Canvas-based**: Smooth signature drawing with mouse and touch support
- **Validation**: Ensures signatures are provided before proceeding
- **Clear Function**: Easy signature clearing and re-signing

### **Multi-Language Support**
- **10 Languages**: English, Spanish, French, German, Italian, Chinese (Simplified/Traditional), Japanese, Korean, Arabic
- **Dynamic Switching**: Change language at any time during the process

### **Data Management**
- **PDF Generation**: Download consent records as text files
- **Local Storage**: Remembers user preferences and theme choices
- **Form Persistence**: Data is maintained throughout the session

## 🚀 Quick Start

### **Prerequisites**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server)

### **Local Development**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd delight-consent-demo
   ```

2. **Start the development server**
   ```bash
   python3 -m http.server 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### **Available Versions**
- **Original Version**: `http://localhost:8000/index.html` - Adaptive theme
- **Light Version**: `http://localhost:8000/index-light.html` - Always light mode

## 📁 Project Structure

```
delight-consent-demo/
├── index.html              # Main application (adaptive theme)
├── index-light.html        # Light version
├── style.css              # Main stylesheet
├── style-light.css        # Light version styles
├── app.js                 # Application logic
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── delight_*.png         # Architecture diagrams
```

## 🎨 Design System

### **Color Palette**
- **Primary**: Teal (#218081)
- **Secondary**: Brown (#5E5240)
- **Success**: Teal (#218081)
- **Error**: Red (#C0152F)
- **Warning**: Orange (#A84B2F)

### **Typography**
- **Font Family**: System fonts with fallbacks
- **Font Sizes**: 12px to 36px scale
- **Line Heights**: 1.25 (tight) to 1.625 (relaxed)

### **Spacing**
- **Base Unit**: 4px
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px

## 🔧 Customization

### **Theme Variables**
All colors and design tokens are defined as CSS custom properties in `:root`:

```css
:root {
  --color-primary: #218081;
  --color-background: #fcfcf9;
  --color-text: #133452;
  /* ... more variables */
}
```

### **Adding New Languages**
1. Add language option to the select dropdown in HTML
2. Implement translation logic in `app.js`
3. Add language-specific content

### **Modifying Consent Questions**
Edit the form structure in the consent screen section of the HTML files.

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📱 Mobile Support

- **iOS**: Safari 14+
- **Android**: Chrome 90+
- **Responsive**: All screen sizes supported

## 🔒 Privacy & Security

- **Client-side Only**: No data is sent to external servers
- **Local Storage**: User preferences stored locally
- **No Tracking**: No analytics or tracking scripts
- **GDPR Compliant**: Designed with privacy in mind

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions:
- **Email**: delight@research.edu.au
- **Phone**: 1800-DELIGHT

## 🙏 Acknowledgments

- **Material Design 3**: Google's design system
- **Medical Research Standards**: Following best practices for consent management
- **Accessibility Guidelines**: WCAG 2.1 AA compliance

---

**DELIGHT Study Team**  
*Digital Consent Management System*  
Version 1.0.0 