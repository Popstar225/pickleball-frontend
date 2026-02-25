/**
 * 🎯 Performance-Optimized Animation System
 * Uses Intersection Observer API for scroll-triggered animations
 * No delays, immediate start when elements enter viewport
 */

// Export animation classes for components
export const componentAnimations = {
  hero: {
    title: "animate-on-scroll hero-title",
    subtitle: "animate-on-scroll hero-subtitle",
    cta: "animate-on-scroll hero-cta"
  },
  features: [
    "animate-on-scroll feature",
    "animate-on-scroll feature",
    "animate-on-scroll feature",
    "animate-on-scroll feature",
    "animate-on-scroll feature",
    "animate-on-scroll feature"
  ],
  cards: [
    "animate-on-scroll card",
    "animate-on-scroll card",
    "animate-on-scroll card"
  ],
  testimonials: [
    "animate-on-scroll testimonial-left",
    "animate-on-scroll testimonial-right",
    "animate-on-scroll testimonial-left",
    "animate-on-scroll testimonial-right"
  ],
  roleBenefits: {
    images: [
      "animate-on-scroll",
      "animate-on-scroll",
      "animate-on-scroll"
    ],
    content: [
      "animate-on-scroll",
      "animate-on-scroll", 
      "animate-on-scroll"
    ]
  }
};

export class AnimationController {
  private observer: IntersectionObserver;
  private animatedElements: Set<Element> = new Set();

  constructor() {
    // Create intersection observer with performance-optimized options
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
            this.animateElement(entry.target);
            this.animatedElements.add(entry.target);
          }
        });
      },
      {
        // Performance-optimized thresholds
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px', // Start animation slightly before element fully enters
        root: null // Use viewport as root
      }
    );
  }

  /**
   * Initialize animations for all elements with animate-on-scroll class
   */
  public init(): void {
    // Find all elements that should animate
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    
    elementsToAnimate.forEach((element) => {
      // Add specific classes based on element type for different animations
      this.addElementTypeClasses(element);
      
      // Start observing the element
      this.observer.observe(element);
    });

    // Also observe dynamically added elements
    this.observeDynamicElements();
  }

  /**
   * Add specific animation classes based on element type
   */
  private addElementTypeClasses(element: Element): void {
    const tagName = element.tagName.toLowerCase();
    const className = element.className;

    // Add specific classes for different element types
    switch (tagName) {
      case 'h1':
        if (className.includes('hero')) {
          element.classList.add('hero-title');
        }
        break;
      case 'h2':
        if (className.includes('hero')) {
          element.classList.add('hero-subtitle');
        }
        break;
      case 'button':
        if (className.includes('hero') || className.includes('cta')) {
          element.classList.add('hero-cta');
        }
        break;
      case 'div':
        if (className.includes('card')) {
          element.classList.add('card');
        } else if (className.includes('feature')) {
          element.classList.add('feature');
        } else if (className.includes('testimonial')) {
          // Alternate left/right for testimonials
          const testimonialIndex = Array.from(document.querySelectorAll('.testimonial')).indexOf(element);
          element.classList.add(testimonialIndex % 2 === 0 ? 'testimonial-left' : 'testimonial-right');
        } else if (className.includes('nav')) {
          element.classList.add('nav-item');
        } else if (className.includes('footer')) {
          element.classList.add('footer-item');
        }
        break;
    }
  }

  /**
   * Trigger animation for a specific element
   */
  private animateElement(element: Element): void {
    // Add the animate-in class to trigger the CSS animation
    element.classList.add('animate-in');
    
    // Optional: Add a subtle entrance effect
    if (element instanceof HTMLElement) {
      element.style.animationPlayState = 'running';
    }
  }

  /**
   * Observe dynamically added elements
   */
  private observeDynamicElements(): void {
    // Use MutationObserver to watch for new elements
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the new element has the animate-on-scroll class
            if (element.classList.contains('animate-on-scroll')) {
              this.addElementTypeClasses(element);
              this.observer.observe(element);
            }
            
            // Check child elements
            const childElements = element.querySelectorAll('.animate-on-scroll');
            childElements.forEach((child) => {
              this.addElementTypeClasses(child);
              this.observer.observe(child);
            });
          }
        });
      });
    });

    // Start observing the entire document
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Manually trigger animation for an element
   */
  public animateElementNow(element: Element): void {
    if (!this.animatedElements.has(element)) {
      this.animateElement(element);
      this.animatedElements.add(element);
    }
  }

  /**
   * Reset animations for testing
   */
  public reset(): void {
    this.animatedElements.clear();
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((element) => {
      element.classList.remove('animate-in');
    });
  }

  /**
   * Clean up observer
   */
  public destroy(): void {
    this.observer.disconnect();
    this.animatedElements.clear();
  }
}

/**
 * 🚀 Quick initialization function
 */
export function initAnimations(): AnimationController {
  const controller = new AnimationController();
  controller.init();
  return controller;
}

/**
 * 🎭 Utility function to add animation class to any element
 */
export function addAnimationClass(element: Element, additionalClass?: string): void {
  element.classList.add('animate-on-scroll');
  if (additionalClass) {
    element.classList.add(additionalClass);
  }
}

/**
 * 📱 Check if device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 🎯 Auto-initialize animations when DOM is ready
 */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!prefersReducedMotion()) {
        initAnimations();
      }
    });
  } else {
    if (!prefersReducedMotion()) {
      initAnimations();
    }
  }
} 