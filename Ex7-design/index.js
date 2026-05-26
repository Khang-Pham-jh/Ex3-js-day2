(() => {
  'use strict';

  const sectionIds = {
    home: 'home',
    services: 'services',
    about: 'about',
    portfolio: 'portfolio',
    contact: 'contact',
  };

  const serviceOptions = ['Web Design', 'Development', 'Branding', 'Consulting'];

  const fieldDefinitions = {
    name: {
      label: 'Name',
      validate: (value) => (value.trim() ? '' : 'required'),
    },
    email: {
      label: 'Email',
      validate: (value) => {
        const trimmed = value.trim();

        if (!trimmed) {
          return 'required';
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? '' : 'invalid format';
      },
    },
    phone: {
      label: 'Phone Number',
      validate: (value) => {
        const trimmed = value.trim();

        if (!trimmed) {
          return 'required';
        }

        const digitCount = (trimmed.match(/\d/g) || []).length;

        return /^\+?[0-9\s().-]+$/.test(trimmed) && digitCount >= 7
          ? ''
          : 'invalid format';
      },
    },
    timeline: {
      label: 'Timeline',
      validate: (value) => (value.trim() ? '' : 'required'),
    },
    'project-details': {
      label: 'Project Details',
      validate: (value) => (value.trim() ? '' : 'required'),
    },
  };

  const normalizeText = (value) =>
    String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  const scrollToSection = (key) => {
    const sectionId = sectionIds[key];

    if (!sectionId) {
      return;
    }

    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const setActiveNav = (key) => {
    const desktopLinks = document.querySelectorAll('.site-nav-link');

    desktopLinks.forEach((link) => {
      const isActive = link.dataset.target === key;
      link.classList.toggle('site-nav-link-active', isActive);
    });
  };

  const setupNavigation = () => {
    const navLinks = document.querySelectorAll('.site-nav-link, .footer-nav-link');

    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();

        const sectionKey = normalizeText(link.dataset.target);

        if (!sectionIds[sectionKey]) {
          return;
        }

        scrollToSection(sectionKey);
        setActiveNav(sectionKey);
      });
    });
  };

  const setupPortfolioFilters = () => {
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const filters = Array.from(document.querySelectorAll('.portfolio-filter'));

    if (!cards.length || !filters.length) {
      return;
    }

    const applyFilter = (category) => {
      cards.forEach((card) => {
        const categories = (card.dataset.category || '').split(/\s+/).filter(Boolean);
        const isVisible = category === 'all' || categories.includes(category);

        card.hidden = !isVisible;
        card.classList.toggle('project-is-hidden', !isVisible);
      });

      filters.forEach((filter) => {
        const isSelected = filter.dataset.filter === category;
        filter.dataset.state = isSelected ? 'selected' : 'unselected';
        filter.setAttribute('aria-pressed', String(isSelected));
      });
    };

    filters.forEach((filter) => {
      filter.addEventListener('click', () => {
        const category = filter.dataset.filter || 'all';
        applyFilter(category);
      });
    });

    applyFilter('all');
  };

  const ensureFieldError = (fieldNode) => {
    let errorNode = fieldNode.querySelector('.field-error');

    if (!errorNode) {
      errorNode = document.createElement('p');
      errorNode.className = 'field-error';
      errorNode.setAttribute('aria-live', 'polite');
      errorNode.textContent = '\u00A0';
      fieldNode.appendChild(errorNode);
    }

    return errorNode;
  };

  const setupDropdown = () => {
    const selectButton = document.querySelector('.contact-form-select');

    if (!selectButton) {
      return { getValue: () => '', validate: () => true };
    }

    const field = selectButton.closest('.contact-form-field');
    const label = selectButton.querySelector('.contact-form-select-label');
    const errorNode = ensureFieldError(field);

    const panel = document.createElement('div');
    panel.className = 'js-dropdown-panel';
    panel.setAttribute('role', 'listbox');
    field.appendChild(panel);

    selectButton.dataset.selectedValue = '';
    selectButton.setAttribute('aria-invalid', 'false');

    const close = () => {
      panel.classList.remove('open');
      selectButton.setAttribute('aria-expanded', 'false');
    };

    const open = () => {
      panel.classList.add('open');
      selectButton.setAttribute('aria-expanded', 'true');
    };

    serviceOptions.forEach((option) => {
      const optionNode = document.createElement('button');
      optionNode.type = 'button';
      optionNode.className = 'js-dropdown-option';
      optionNode.setAttribute('role', 'option');
      optionNode.textContent = option;

      optionNode.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        label.textContent = option;
        selectButton.dataset.selectedValue = option;
        selectButton.setAttribute('aria-invalid', 'false');
        errorNode.textContent = '\u00A0';
        close();
      });

      panel.appendChild(optionNode);
    });

    selectButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (panel.classList.contains('open')) {
        close();
      } else {
        open();
      }
    });

    selectButton.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        if (panel.classList.contains('open')) {
          close();
        } else {
          open();
        }
      }
    });

    document.addEventListener('click', (event) => {
      if (!field.contains(event.target)) {
        close();
      }
    });

    const validate = () => {
      const selectedValue = selectButton.dataset.selectedValue || '';

      if (!selectedValue) {
        selectButton.setAttribute('aria-invalid', 'true');
        errorNode.textContent = 'required';
        return false;
      }

      selectButton.setAttribute('aria-invalid', 'false');
      errorNode.textContent = '\u00A0';
      return true;
    };

    const getValue = () => selectButton.dataset.selectedValue || '';

    return { getValue, validate };
  };

  const setupContactForm = () => {
    const form = document.querySelector('.contact-form');

    if (!form) {
      return;
    }

    const statusNode = form.querySelector('.contact-form-status');
    const dropdown = setupDropdown();

    const fieldEntries = Object.entries(fieldDefinitions).map(([key, definition]) => {
      const input = form.querySelector(`[data-field="${key}"]`);

      if (!input) {
        return null;
      }

      const fieldNode = input.closest('.contact-form-field');
      const errorNode = ensureFieldError(fieldNode);

      const validate = () => {
        const error = definition.validate(input.value || '');
        input.setAttribute('aria-invalid', error ? 'true' : 'false');
        errorNode.textContent = error || '\u00A0';
        return !error;
      };

      input.addEventListener('blur', validate);
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') {
          validate();
        }
      });

      return { key, definition, input, validate };
    }).filter(Boolean);

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (statusNode) {
        statusNode.textContent = '';
      }

      const payload = {
        name: '',
        email: '',
        phone: '',
        serviceOfInterest: '',
        timeline: '',
        projectDetails: '',
      };
      let hasError = false;

      fieldEntries.forEach((field) => {
        const isValid = field.validate();
        const trimmedValue = (field.input.value || '').trim();

        if (field.key === 'project-details') {
          payload.projectDetails = trimmedValue;
        } else {
          payload[field.key] = trimmedValue;
        }

        if (!isValid) {
          hasError = true;
        }
      });

      payload.serviceOfInterest = dropdown.getValue();

      if (!dropdown.validate()) {
        hasError = true;
      }

      if (hasError) {
        if (statusNode) {
          statusNode.textContent = 'Please fix the highlighted fields.';
        }

        const firstInvalid = form.querySelector('[aria-invalid="true"]');

        if (firstInvalid) {
          firstInvalid.focus();
        }

        return;
      }

      console.log(payload);
      window.alert('send successfully');
    });
  };

  const closeMobileMenu = () => {
    document.querySelector('.js-mobile-menu-backdrop')?.classList.remove('open');
    document.querySelector('.js-mobile-menu-panel')?.classList.remove('open');
    document.querySelector('.mobile-menu-toggle')?.setAttribute('aria-expanded', 'false');
  };

  const setupMobileMenu = () => {
    const menuToggle = document.querySelector('.mobile-menu-toggle');

    if (!menuToggle) {
      return;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'js-mobile-menu-backdrop';

    const panel = document.createElement('div');
    panel.className = 'js-mobile-menu-panel';

    Object.entries(sectionIds).forEach(([key]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'js-mobile-menu-item';
      button.textContent = key === 'home' ? 'Home' : key === 'about' ? 'About me' : key.charAt(0).toUpperCase() + key.slice(1);
      button.dataset.target = key;

      button.addEventListener('click', () => {
        scrollToSection(key);
        setActiveNav(key);
        closeMobileMenu();
      });

      panel.appendChild(button);
    });

    document.body.append(backdrop, panel);

    const toggleMenu = () => {
      const isOpen = panel.classList.toggle('open');
      backdrop.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    };

    menuToggle.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMobileMenu);
    window.addEventListener('resize', closeMobileMenu);
    window.addEventListener('scroll', closeMobileMenu, { passive: true });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    });
  };

  const init = () => {
    document.documentElement.style.scrollBehavior = 'smooth';

    setupNavigation();
    setupPortfolioFilters();
    setupContactForm();
    setupMobileMenu();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
