(() => {
  const sectionSelectors = {
    home: ['.desktop-1 .section-home', '.only-mobile .section-home'],
    services: ['.desktop-1 .section-services', '.only-mobile .section-services'],
    about: ['.desktop-1 .section-about', '.only-mobile .section-about'],
    portfolio: ['.desktop-1 .section-portfolio', '.only-mobile .section-portfolio'],
    contact: ['.desktop-1 .section-contact', '.only-mobile .section-contact'],
  };

  const fieldDefinitions = [
    {
      key: 'name',
      placeholder: 'Name',
      validate: (value) => (value.trim() ? '' : 'required'),
    },
    {
      key: 'email',
      placeholder: 'Email',
      validate: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? ''
          : 'invalid format',
    },
    {
      key: 'phone',
      placeholder: 'Phone Number',
      validate: (value) => {
        const trimmed = value.trim();
        const digitCount = (trimmed.match(/\d/g) || []).length;

        return /^\+?[0-9\s().-]+$/.test(trimmed) && digitCount >= 7
          ? ''
          : 'invalid format';
      },
    },
    {
      key: 'timeline',
      placeholder: 'Timeline',
      validate: (value) => (value.trim() ? '' : 'required'),
    },
    {
      key: 'projectDetails',
      placeholder: 'Project Details...',
      validate: (value) => (value.trim() ? '' : 'required'),
    },
  ];

  const tooltipLabels = ['Instagram', 'LinkedIn', 'Dribbble', 'Behance'];

  const normalizeText = (value) =>
    value.replace(/\s+/g, ' ').trim().toLowerCase();

  const isVisible = (element) => {
    if (!element) {
      return false;
    }

    const computedStyle = window.getComputedStyle(element);

    return (
      computedStyle.display !== 'none' &&
      computedStyle.visibility !== 'hidden' &&
      element.getClientRects().length > 0
    );
  };

  const getVisibleTarget = (key) => {
    for (const selector of sectionSelectors[key] || []) {
      const element = document.querySelector(selector);

      if (isVisible(element)) {
        return element;
      }
    }

    return null;
  };

  const scrollToSection = (key) => {
    const target = getVisibleTarget(key);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const closeMobileMenu = () => {
    const backdrop = document.querySelector('.js-mobile-menu-backdrop');
    const panel = document.querySelector('.js-mobile-menu-panel');

    if (backdrop) {
      backdrop.classList.remove('open');
    }

    if (panel) {
      panel.classList.remove('open');
    }
  };

  const openMobileMenu = () => {
    const backdrop = document.querySelector('.js-mobile-menu-backdrop');
    const panel = document.querySelector('.js-mobile-menu-panel');

    if (backdrop) {
      backdrop.classList.add('open');
    }

    if (panel) {
      panel.classList.add('open');
    }
  };

  const toggleMobileMenu = () => {
    const panel = document.querySelector('.js-mobile-menu-panel');

    if (!panel) {
      return;
    }

    if (panel.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  const ensureErrorNode = (input) => {
    let wrapper = input.closest('.field-group');

    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'field-group';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
    }

    if (input.matches('textarea')) {
      wrapper.classList.add('field-group--textarea');
    }

    let errorNode = wrapper.querySelector('.field-error');

    if (!errorNode) {
      errorNode = document.createElement('div');
      errorNode.className = 'field-error';
      errorNode.setAttribute('aria-live', 'polite');
      wrapper.appendChild(errorNode);
    }

    return { wrapper, errorNode };
  };

  const validateField = (input, errorNode) => {
    const definition = fieldDefinitions.find(
      (item) => item.placeholder === input.placeholder,
    );

    if (!definition) {
      return true;
    }

    const errorMessage = definition.validate(input.value);

    errorNode.textContent = errorMessage || '\u00A0';
    input.setAttribute('aria-invalid', errorMessage ? 'true' : 'false');

    return !errorMessage;
  };

  const setupTooltipGroup = (groupElement) => {
    const iconItems = groupElement.querySelectorAll('.actions, .ellipse-parent');

    iconItems.forEach((item, index) => {
      const label = tooltipLabels[index] || tooltipLabels[tooltipLabels.length - 1];

      item.title = label;
      item.setAttribute('aria-label', label);

      const button = item.querySelector('button');

      if (button) {
        button.title = label;
        button.setAttribute('aria-label', label);
      }
    });
  };

  const setupNavigation = (shell) => {
    const textToSection = {
      home: 'home',
      services: 'services',
      'about me': 'about',
      portfolio: 'portfolio',
      'contact me': 'contact',
    };

    const navigationItems = shell.querySelectorAll(
      '.home-parent h3, .navigation h3, .footer-links > *',
    );

    navigationItems.forEach((item) => {
      const key = textToSection[normalizeText(item.textContent || '')];

      if (!key) {
        return;
      }

      item.style.cursor = 'pointer';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      const activate = () => scrollToSection(key);

      item.addEventListener('click', activate);
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });
  };

  const setupMobileProjectCarousel = (shell, getFilteredItems) => {
    const projectGrid = shell.querySelector('.project-grid');

    if (!projectGrid || projectGrid.dataset.carouselEnhanced === 'true') {
      return null;
    }

    projectGrid.dataset.carouselEnhanced = 'true';

    const carouselShell = document.createElement('div');
    carouselShell.className = 'js-mobile-project-carousel';

    const viewport = document.createElement('div');
    viewport.className = 'js-mobile-project-carousel-viewport';

    const track = document.createElement('div');
    track.className = 'js-mobile-project-carousel-track';

    const controls = document.createElement('div');
    controls.className = 'js-mobile-project-carousel-controls';

    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className = 'js-mobile-project-carousel-btn';
    prevButton.textContent = '‹';
    prevButton.setAttribute('aria-label', 'Previous project');

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'js-mobile-project-carousel-btn';
    nextButton.textContent = '›';
    nextButton.setAttribute('aria-label', 'Next project');

    controls.append(prevButton, nextButton);
    viewport.appendChild(track);
    carouselShell.append(viewport, controls);

    projectGrid.parentNode.insertBefore(carouselShell, projectGrid);
    carouselShell.appendChild(projectGrid);
    projectGrid.classList.add('js-original-project-grid');
    projectGrid.style.display = 'none';

    let activeItems = [];
    let activeIndex = 0;
    let isAnimating = false;

    const cloneProjectCard = (item) => {
      const clone = item.cloneNode(true);

      clone.hidden = false;
      clone.classList.remove(
        'project-is-hidden',
        'js-carousel-slide',
        'slide-in-left',
        'slide-in-right',
        'slide-out-left',
        'slide-out-right',
      );

      clone.removeAttribute('style');
      clone.classList.add('js-carousel-slide');

      return clone;
    };

    const updateControls = () => {
      const shouldDisable = activeItems.length <= 1;

      prevButton.disabled = shouldDisable;
      nextButton.disabled = shouldDisable;
    };

    const renderInitialSlide = () => {
      track.innerHTML = '';

      if (!activeItems.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'js-carousel-empty';
        emptyState.textContent = 'No projects found';
        track.appendChild(emptyState);
        updateControls();
        return;
      }

      const currentSlide = cloneProjectCard(activeItems[activeIndex]);
      track.appendChild(currentSlide);
      updateControls();
    };

    const goToSlide = (nextIndex, direction = 'next') => {
      if (isAnimating || !activeItems.length || nextIndex === activeIndex) {
        return;
      }

      isAnimating = true;

      const currentSlide = track.querySelector('.js-carousel-slide');
      const nextSlide = cloneProjectCard(activeItems[nextIndex]);

      const enteringClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
      const leavingClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';

      nextSlide.classList.add(enteringClass);
      track.appendChild(nextSlide);

      requestAnimationFrame(() => {
        if (currentSlide) {
          currentSlide.classList.add(leavingClass);
        }

        nextSlide.classList.remove(enteringClass);
      });

      window.setTimeout(() => {
        activeIndex = nextIndex;
        track.innerHTML = '';
        track.appendChild(cloneProjectCard(activeItems[activeIndex]));
        isAnimating = false;
      }, 360);
    };

    const showNext = () => {
      if (!activeItems.length) {
        return;
      }

      const nextIndex = (activeIndex + 1) % activeItems.length;
      goToSlide(nextIndex, 'next');
    };

    const showPrev = () => {
      if (!activeItems.length) {
        return;
      }

      const nextIndex = (activeIndex - 1 + activeItems.length) % activeItems.length;
      goToSlide(nextIndex, 'prev');
    };

    const refresh = () => {
      activeItems = getFilteredItems();
      activeIndex = 0;
      renderInitialSlide();
    };

    prevButton.addEventListener('click', showPrev);
    nextButton.addEventListener('click', showNext);

    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerCurrentX = 0;
    let isDragging = false;

    const minSwipeDistance = 45;

    viewport.addEventListener('pointerdown', (event) => {
      if (activeItems.length <= 1 || isAnimating) {
        return;
      }

      isDragging = true;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerCurrentX = event.clientX;

      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener('pointermove', (event) => {
      if (!isDragging || isAnimating) {
        return;
      }

      pointerCurrentX = event.clientX;

      const diffX = pointerCurrentX - pointerStartX;
      const diffY = event.clientY - pointerStartY;

      if (Math.abs(diffY) > Math.abs(diffX)) {
        return;
      }

      const currentSlide = track.querySelector('.js-carousel-slide');

      if (currentSlide) {
        currentSlide.style.transform = `translateX(calc(-50% + ${diffX}px))`;
        currentSlide.style.opacity = String(Math.max(0.45, 1 - Math.abs(diffX) / 280));
      }
    });

    const finishPointerSwipe = () => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      viewport.classList.remove('is-dragging');

      const diffX = pointerCurrentX - pointerStartX;
      const currentSlide = track.querySelector('.js-carousel-slide');

      if (currentSlide) {
        currentSlide.style.transform = '';
        currentSlide.style.opacity = '';
      }

      if (Math.abs(diffX) < minSwipeDistance) {
        return;
      }

      if (diffX < 0) {
        showNext();
      } else {
        showPrev();
      }
    };

    viewport.addEventListener('pointerup', finishPointerSwipe);
    viewport.addEventListener('pointercancel', finishPointerSwipe);
    viewport.addEventListener('lostpointercapture', finishPointerSwipe);

    refresh();

    return {
      refresh,
    };
  };

  const setupPortfolioFilters = (shell) => {
    const items = Array.from(
      shell.querySelectorAll('.project-cards, .project-container4'),
    );

    const categoryByImage = {
      'Project-Backgrounds@2x.png': ['website-design', 'app-mobile-design'],
      'Rectangle-26@2x.png': ['app-desktop', 'landing-page-design'],
      'Rectangle-22@2x.png': ['braiding'],
    };

    items.forEach((item) => {
      const existingCategory = item.dataset.category || '';
      const image = item.querySelector('img');
      const source = image ? image.getAttribute('src') || '' : '';

      let categories = existingCategory.split(' ').filter(Boolean);

      if (!categories.length) {
        Object.entries(categoryByImage).forEach(([fileName, categoryList]) => {
          if (source.includes(fileName)) {
            categories = categoryList;
          }
        });
      }

      item.dataset.category = categories.join(' ');
      item.hidden = false;
      item.classList.remove('project-is-hidden');
    });

    const filterRoots = Array.from(
      shell.querySelectorAll('.portfolio-filters, .filter-container-parent'),
    );

    const filterControls = Array.from(
      shell.querySelectorAll(
        '.portfolio-filters > *, .filter-container-parent > *',
      ),
    ).filter((item) => normalizeText(item.textContent || ''));

    const labelToCategory = {
      all: 'all',
      'website design': 'website-design',
      'app mobile design': 'app-mobile-design',
      'app desktop': 'app-desktop',
      'landing page design': 'landing-page-design',
      braiding: 'braiding',
    };

    let currentLabel = 'all';

    const getFilteredItems = () => {
      const targetCategory = labelToCategory[currentLabel];

      return items.filter((item) => {
        const itemCategories = (item.dataset.category || '').split(' ');

        return targetCategory === 'all' || itemCategories.includes(targetCategory);
      });
    };

    const mobileCarousel = shell.classList.contains('only-mobile')
      ? setupMobileProjectCarousel(shell, getFilteredItems)
      : null;

    const setActiveFilter = (activeLabel) => {
      filterControls.forEach((control) => {
        const label = normalizeText(control.textContent || '');
        control.classList.toggle('js-active-filter', label === activeLabel);
      });
    };

    const applyFilter = (activeLabel) => {
      currentLabel = activeLabel;

      const targetCategory = labelToCategory[activeLabel];

      items.forEach((item) => {
        const itemCategories = (item.dataset.category || '').split(' ');
        const shouldShow =
          targetCategory === 'all' || itemCategories.includes(targetCategory);

        item.hidden = !shouldShow;
        item.classList.toggle('project-is-hidden', !shouldShow);
      });

      setActiveFilter(activeLabel);

      if (mobileCarousel) {
        mobileCarousel.refresh();
      }
    };

    filterRoots.forEach((root) => {
      root.addEventListener('click', (event) => {
        const control = event.target.closest(
          'button, .portfolio-filter-buttons, .portfolio-filter-buttons2, .portfolio-filter-buttons3, .filter-container, .filter-container2, .filter-container3, .filter-container6',
        );

        if (!control || !root.contains(control)) {
          return;
        }

        const label = normalizeText(control.textContent || '');

        if (!Object.prototype.hasOwnProperty.call(labelToCategory, label)) {
          return;
        }

        event.preventDefault();
        applyFilter(label);
      });
    });

    applyFilter('all');
  };

  const ensureDropdownErrorNode = (dropdown) => {
    let wrapper = dropdown.closest('.field-group');

    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'field-group';
      dropdown.parentNode.insertBefore(wrapper, dropdown);
      wrapper.appendChild(dropdown);
    }

    let errorNode = wrapper.querySelector('.field-error');

    if (!errorNode) {
      errorNode = document.createElement('div');
      errorNode.className = 'field-error';
      errorNode.setAttribute('aria-live', 'polite');
      wrapper.appendChild(errorNode);
    }

    return { wrapper, errorNode };
  };

  const setupDropdown = (shell) => {
    const dropdowns = Array.from(
      shell.querySelectorAll('.service-of-interest-parent, .input-container4'),
    );

    dropdowns.forEach((dropdown) => {
      if (dropdown.dataset.enhanced === 'true') {
        return;
      }

      const labelNode = dropdown.querySelector('.service-of-interest');

      if (!labelNode) {
        return;
      }

      const { errorNode } = ensureDropdownErrorNode(dropdown);

      dropdown.dataset.enhanced = 'true';
      dropdown.dataset.selectedValue = '';
      dropdown.style.position = 'relative';
      dropdown.style.cursor = 'pointer';

      dropdown.setAttribute('role', 'button');
      dropdown.setAttribute('tabindex', '0');
      dropdown.setAttribute('aria-haspopup', 'listbox');
      dropdown.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-invalid', 'false');

      const panel = document.createElement('div');
      panel.className = 'js-dropdown-panel';
      panel.setAttribute('role', 'listbox');

      ['Web Design', 'Development', 'Branding', 'Consulting'].forEach((option) => {
        const optionButton = document.createElement('button');

        optionButton.type = 'button';
        optionButton.className = 'js-dropdown-option';
        optionButton.textContent = option;
        optionButton.setAttribute('role', 'option');

        optionButton.addEventListener('click', (event) => {
          event.stopPropagation();

          labelNode.textContent = option;
          dropdown.dataset.selectedValue = option;
          dropdown.setAttribute('aria-invalid', 'false');
          errorNode.textContent = '\u00A0';

          panel.classList.remove('open');
          dropdown.setAttribute('aria-expanded', 'false');
        });

        panel.appendChild(optionButton);
      });

      dropdown.appendChild(panel);

      const togglePanel = () => {
        const isOpen = panel.classList.toggle('open');
        dropdown.setAttribute('aria-expanded', String(isOpen));
      };

      const closePanel = () => {
        panel.classList.remove('open');
        dropdown.setAttribute('aria-expanded', 'false');
      };

      dropdown.addEventListener('click', (event) => {
        if (event.target.closest('.js-dropdown-option')) {
          return;
        }

        event.stopPropagation();
        togglePanel();
      });

      dropdown.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          togglePanel();
        }

        if (event.key === 'Escape') {
          closePanel();
        }
      });

      document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target)) {
          closePanel();
        }
      });
    });
  };

  const setupContactValidation = (shell) => {
    const inputs = Array.from(
      shell.querySelectorAll(
        '.contact-form input, .contact-form textarea, .input-container-parent input, .input-container-parent textarea',
      ),
    ).filter((input) =>
      fieldDefinitions.some((field) => field.placeholder === input.placeholder),
    );

    const inputMetadata = inputs.map((input) => {
      const { errorNode } = ensureErrorNode(input);

      input.required = true;

      if (input.placeholder === 'Email') {
        input.type = 'email';
      }

      if (input.placeholder === 'Phone Number') {
        input.type = 'tel';
      }

      const definition = fieldDefinitions.find(
        (item) => item.placeholder === input.placeholder,
      );

      const updateError = () => validateField(input, errorNode);

      input.addEventListener('blur', updateError);
      input.addEventListener('input', () => {
        if (errorNode.textContent) {
          updateError();
        }
      });

      return { input, errorNode, definition };
    });

    const submitButton = shell.querySelector('.send-wrapper');

    if (submitButton) {
      submitButton.addEventListener('click', (event) => {
        event.preventDefault();

        const issues = [];
        const payload = {};

        inputMetadata.forEach(({ input, errorNode, definition }) => {
          if (!definition) {
            return;
          }

          const errorMessage = definition.validate(input.value);

          errorNode.textContent = errorMessage || '\u00A0';
          input.setAttribute('aria-invalid', errorMessage ? 'true' : 'false');

          payload[definition.key] = input.value.trim();

          if (errorMessage) {
            issues.push(`${definition.placeholder}: ${errorMessage}`);
          }
        });

        const dropdown = shell.querySelector(
          '.service-of-interest-parent, .input-container4',
        );

        if (dropdown) {
          const dropdownLabel = dropdown.querySelector('.service-of-interest');
          const dropdownError = dropdown.closest('.field-group')?.querySelector('.field-error');
          const selectedService = dropdown.dataset.selectedValue || '';

          payload.serviceOfInterest = selectedService;

          if (!selectedService) {
            dropdown.setAttribute('aria-invalid', 'true');

            if (dropdownError) {
              dropdownError.textContent = 'required';
            }

            issues.push('Service of Interest: required');
          } else {
            dropdown.setAttribute('aria-invalid', 'false');

            if (dropdownError) {
              dropdownError.textContent = '\u00A0';
            }

            if (dropdownLabel) {
              payload.serviceOfInterest = dropdownLabel.textContent.trim();
            }
          }
        }

        if (issues.length) {
          window.alert(issues.join('\n'));
          return;
        }

        console.log(JSON.stringify(payload, null, 2));
      });
    }
  };

  const setupShell = (shell) => {
    setupNavigation(shell);
    setupPortfolioFilters(shell);
    setupDropdown(shell);
    setupContactValidation(shell);

    shell
      .querySelectorAll('.behance, .social-links, .social-icons2')
      .forEach(setupTooltipGroup);
  };


  document.documentElement.style.scrollBehavior = 'smooth';

  const shells = Array.from(document.querySelectorAll('.desktop-1, .only-mobile'));

  shells.forEach(setupShell);

  const mobileShell = document.querySelector('.only-mobile');
  const mobileToggle = mobileShell
    ? mobileShell.querySelector('.align-justify-icon')
    : null;

  if (mobileToggle) {
    mobileToggle.setAttribute('role', 'button');
    mobileToggle.setAttribute('tabindex', '0');
    mobileToggle.setAttribute('aria-label', 'Open menu');

    const backdrop = document.createElement('div');
    backdrop.className = 'js-mobile-menu-backdrop';

    const panel = document.createElement('div');
    panel.className = 'js-mobile-menu-panel';

    [
      ['Home', 'home'],
      ['Services', 'services'],
      ['About me', 'about'],
      ['Portfolio', 'portfolio'],
      ['Contact me', 'contact'],
    ].forEach(([label, key]) => {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'js-mobile-menu-item';
      button.textContent = label;

      button.addEventListener('click', () => {
        scrollToSection(key);
        closeMobileMenu();
      });

      panel.appendChild(button);
    });

    backdrop.addEventListener('click', closeMobileMenu);
    panel.addEventListener('click', (event) => event.stopPropagation());

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    mobileToggle.addEventListener('click', toggleMobileMenu);

    mobileToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleMobileMenu();
      }
    });

    window.addEventListener('resize', closeMobileMenu);
    window.addEventListener('scroll', closeMobileMenu, { passive: true });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }
})();