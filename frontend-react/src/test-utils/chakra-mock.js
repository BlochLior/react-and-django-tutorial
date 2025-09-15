const React = require('react');

// List of valid HTML attributes that can be passed to DOM elements
const VALID_HTML_ATTRS = [
  'id', 'className', 'style', 'title', 'lang', 'dir', 'hidden', 'tabIndex',
  'accessKey', 'contentEditable', 'draggable', 'spellCheck', 'translate',
  'onClick', 'onDoubleClick', 'onMouseDown', 'onMouseUp', 'onMouseOver',
  'onMouseOut', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onKeyDown',
  'onKeyUp', 'onKeyPress', 'onFocus', 'onBlur', 'onChange', 'onInput',
  'onSubmit', 'onReset', 'onSelect', 'onLoad', 'onError', 'onAbort',
  'onCanPlay', 'onCanPlayThrough', 'onDurationChange', 'onEmptied',
  'onEnded', 'onLoadedData', 'onLoadedMetadata', 'onLoadStart',
  'onPause', 'onPlay', 'onPlaying', 'onProgress', 'onRateChange',
  'onSeeked', 'onSeeking', 'onStalled', 'onSuspend', 'onTimeUpdate',
  'onVolumeChange', 'onWaiting', 'onCopy', 'onCut', 'onPaste',
  'onCompositionEnd', 'onCompositionStart', 'onCompositionUpdate',
  'onTouchCancel', 'onTouchEnd', 'onTouchMove', 'onTouchStart',
  'onScroll', 'onWheel', 'onAnimationEnd', 'onAnimationIteration',
  'onAnimationStart', 'onTransitionEnd', 'role', 'aria-label',
  'aria-labelledby', 'aria-describedby', 'aria-hidden', 'aria-expanded',
  'aria-selected', 'aria-checked', 'aria-disabled', 'aria-required',
  'aria-invalid', 'aria-live', 'aria-atomic', 'aria-busy', 'aria-current',
  'aria-details', 'aria-errormessage', 'aria-flowto', 'aria-haspopup',
  'aria-keyshortcuts', 'aria-modal', 'aria-multiline', 'aria-multiselectable',
  'aria-orientation', 'aria-placeholder', 'aria-pressed', 'aria-readonly',
  'aria-relevant', 'aria-roledescription', 'aria-sort', 'aria-valuemax',
  'aria-valuemin', 'aria-valuenow', 'aria-valuetext', 'aria-autocomplete',
  'aria-colcount', 'aria-colindex', 'aria-colspan', 'aria-rowcount',
  'aria-rowindex', 'aria-rowspan', 'aria-activedescendant', 'aria-controls',
  'aria-describedby', 'aria-owns', 'aria-setsize', 'aria-posinset'
];

// Props that should be preserved for testing purposes
const TEST_PROPS = [
  'size', 'color', 'thickness', 'variant', 'colorscheme', 'lefticon', 'icon',
  'as', 'spacing', 'align', 'justify', 'direction', 'gap', 'py', 'px', 'mb', 'ml'
];

// Filter props to only include valid HTML attributes and test props
const filterValidProps = (props) => {
  const filtered = {};
  Object.keys(props).forEach(key => {
    if (VALID_HTML_ATTRS.includes(key) || 
        TEST_PROPS.includes(key) || 
        key.startsWith('data-') || 
        key.startsWith('aria-')) {
      filtered[key] = props[key];
    }
  });
  return filtered;
};

// Generic mock component creator
const createMockComponent = (name) => {
  const MockComponent = React.forwardRef(({ children, as, ...props }, ref) => {
    const validProps = filterValidProps(props);
    
    // Handle the 'as' prop to render as different elements
    const elementType = as || 'div';
    
    return React.createElement(elementType, {
      ref,
      'data-testid': `chakra-${name.toLowerCase()}`,
      ...validProps
    }, children);
  });
  MockComponent.displayName = name;
  return MockComponent;
};

// Special handling for Spinner component to ensure size, color, thickness are preserved
const createSpinnerMock = () => {
  const MockSpinner = React.forwardRef(({ children, size, color, thickness, spinnerSize, spinnerColor, spinnerThickness, ...props }, ref) => {
    // Handle both direct props and prefixed props
    const finalSize = size || spinnerSize;
    const finalColor = color || spinnerColor;
    const finalThickness = thickness || spinnerThickness;
    
    // Create element with explicit attributes first, then spread other valid props
    const elementProps = {
      ref,
      'data-testid': 'chakra-spinner',
    };
    
    // Use data- attributes that React will definitely preserve
    if (finalSize) elementProps['data-size'] = finalSize;
    if (finalColor) elementProps['data-color'] = finalColor;
    if (finalThickness) elementProps['data-thickness'] = finalThickness;
    
    // Add other valid props
    const validProps = filterValidProps(props);
    Object.assign(elementProps, validProps);
    
    return React.createElement('div', elementProps, children);
  });
  MockSpinner.displayName = 'Spinner';
  return MockSpinner;
};

// Special handling for Alert component to ensure it has the alert role
const createAlertMock = () => {
  const MockAlert = React.forwardRef(({ children, ...props }, ref) => {
    const validProps = filterValidProps(props);
    return React.createElement('div', {
      ref,
      'data-testid': 'chakra-alert',
      role: 'alert', // Ensure alert role is always present
      ...validProps
    }, children);
  });
  MockAlert.displayName = 'Alert';
  return MockAlert;
};

// Special handling for IconButton to ensure it has proper button role and aria-label
const createIconButtonMock = () => {
  const MockIconButton = React.forwardRef(({ children, 'aria-label': ariaLabel, isDisabled, ...props }, ref) => {
    const validProps = filterValidProps(props);
    return React.createElement('button', {
      ref,
      'data-testid': 'chakra-iconbutton',
      type: 'button',
      role: 'button',
      'aria-label': ariaLabel, // Ensure aria-label is preserved
      disabled: isDisabled, // Handle disabled state
      ...validProps
    }, children);
  });
  MockIconButton.displayName = 'IconButton';
  return MockIconButton;
};

// Special handling for RadioGroup to ensure it has proper value attribute and onChange behavior
const createRadioGroupMock = () => {
  const MockRadioGroup = React.forwardRef(({ children, value, onChange, ...props }, ref) => {
    const validProps = filterValidProps(props);
    
    // Clone children and inject the onChange handler
    const childrenWithOnChange = React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          onClick: (e) => {
            // When a radio is clicked, call the RadioGroup's onChange
            if (onChange) {
              onChange(e.target.getAttribute('data-value'));
            }
          }
        });
      }
      return child;
    });
    
    return React.createElement('div', {
      ref,
      'data-testid': 'chakra-radiogroup',
      'data-value': value, // Store value for testing
      ...validProps
    }, childrenWithOnChange);
  });
  MockRadioGroup.displayName = 'RadioGroup';
  return MockRadioGroup;
};

// Special handling for Radio to ensure it has proper value and click behavior
const createRadioMock = () => {
  const MockRadio = React.forwardRef(({ children, value, onClick, ...props }, ref) => {
    const validProps = filterValidProps(props);
    
    const handleClick = (e) => {
      // Call the onClick handler if provided
      if (onClick) {
        onClick(e);
      }
    };
    
    return React.createElement('div', {
      ref,
      'data-testid': 'chakra-radio',
      'data-value': value,
      onClick: handleClick,
      role: 'radio',
      ...validProps
    }, children);
  });
  MockRadio.displayName = 'Radio';
  return MockRadio;
};

// Special handling for FormControl to ensure it has proper label association
const createFormControlMock = () => {
  const MockFormControl = React.forwardRef(({ children, isInvalid, isRequired, ...props }, ref) => {
    const validProps = filterValidProps(props);
    return React.createElement('div', {
      ref,
      'data-testid': 'chakra-formcontrol',
      'data-invalid': isInvalid,
      'data-required': isRequired,
      ...validProps
    }, children);
  });
  MockFormControl.displayName = 'FormControl';
  return MockFormControl;
};

// Special handling for FormLabel to ensure it has proper htmlFor attribute
const createFormLabelMock = () => {
  const MockFormLabel = React.forwardRef(({ children, htmlFor, ...props }, ref) => {
    const validProps = filterValidProps(props);
    return React.createElement('label', {
      ref,
      'data-testid': 'chakra-formlabel',
      htmlFor: htmlFor,
      ...validProps
    }, children);
  });
  MockFormLabel.displayName = 'FormLabel';
  return MockFormLabel;
};

// Special handling for Input to ensure it has proper id and aria attributes
const createInputMock = () => {
  const MockInput = React.forwardRef(({ id, 'aria-describedby': ariaDescribedby, ...props }, ref) => {
    const validProps = filterValidProps(props);
    return React.createElement('input', {
      ref,
      'data-testid': 'chakra-input',
      id: id,
      'aria-describedby': ariaDescribedby,
      ...validProps
    });
  });
  MockInput.displayName = 'Input';
  return MockInput;
};

// Special handling for Button to ensure it handles 'as' prop and RouterLink properly
const createButtonMock = () => {
  const MockButton = React.forwardRef(({ children, as, to, leftIcon, colorScheme, variant, size, isDisabled, ...props }, ref) => {
    const validProps = filterValidProps(props);
    
    // Determine element type and role based on 'as' prop
    let elementType = 'button';
    let role = 'button';
    
    // Check if 'as' prop is provided (any truthy value means it's not a regular button)
    if (as && to) {
      elementType = 'a';
      role = 'link';
    }
    
    const elementProps = {
      ref,
      'data-testid': 'chakra-button',
      role: role,
      disabled: isDisabled, // Handle disabled state
      ...validProps
    };
    
    // Add link-specific attributes
    if (elementType === 'a' && to) {
      elementProps.href = to;
      elementProps['data-to'] = to; // For testing purposes
    }
    
    // Add button-specific attributes
    if (elementType === 'button') {
      elementProps.type = 'button';
    }
    
    // Store other props for testing
    if (colorScheme) elementProps['data-colorscheme'] = colorScheme;
    if (variant) elementProps['data-variant'] = variant;
    if (size) elementProps['data-size'] = size;
    
    return React.createElement(elementType, elementProps, children);
  });
  MockButton.displayName = 'Button';
  return MockButton;
};

// Mock react-icons/fa icons
const FaVoteYea = () => React.createElement('span', { 'data-testid': 'icon-fa-vote-yea' }, '🗳️');
const FaClock = () => React.createElement('span', { 'data-testid': 'icon-fa-clock' }, '⏰');
const FaQuestionCircle = () => React.createElement('span', { 'data-testid': 'icon-fa-question-circle' }, '❓');
const FaExclamationTriangle = () => React.createElement('span', { 'data-testid': 'icon-fa-exclamation-triangle' }, '⚠️');

// Mock ChakraProvider
const ChakraProvider = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'chakra-provider' }, children);
};

// Mock commonly used Chakra UI hooks
const useToast = () => {
  return jest.fn().mockReturnValue({
    toast: jest.fn(),
    toasts: [],
    isActive: jest.fn(),
    close: jest.fn(),
    closeAll: jest.fn(),
    update: jest.fn(),
  });
};

const useDisclosure = () => {
  return {
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
    onToggle: jest.fn(),
    getButtonProps: jest.fn(() => ({})),
    getDisclosureProps: jest.fn(() => ({})),
  };
};

const useColorMode = () => {
  return {
    colorMode: 'light',
    toggleColorMode: jest.fn(),
    setColorMode: jest.fn(),
  };
};

const useColorModeValue = (lightValue, darkValue) => {
  return lightValue;
};

const createToaster = (options) => {
  return {
    toast: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
    isActive: jest.fn(),
    update: jest.fn(),
    ...options,
  };
};

// Mock commonly used Chakra UI components
const mockComponents = {
  // Layout components
  Box: createMockComponent('Box'),
  Flex: createMockComponent('Flex'),
  Grid: createMockComponent('Grid'),
  GridItem: createMockComponent('GridItem'),
  Stack: createMockComponent('Stack'),
  VStack: createMockComponent('VStack'),
  HStack: createMockComponent('HStack'),
  SimpleGrid: createMockComponent('SimpleGrid'),
  Container: createMockComponent('Container'),
  Center: createMockComponent('Center'),
  Wrap: createMockComponent('Wrap'),
  WrapItem: createMockComponent('WrapItem'),
  
  // Typography components
  Text: createMockComponent('Text'),
  Heading: createMockComponent('Heading'),
  Link: createMockComponent('Link'),
  
  // Form components
  Button: createButtonMock(), // Use specialized Button mock
  IconButton: createIconButtonMock(), // Use specialized IconButton mock
  Input: createInputMock(), // Use specialized Input mock
  Textarea: createMockComponent('Textarea'),
  Select: createMockComponent('Select'),
  FormControl: createFormControlMock(), // Use specialized FormControl mock
  FormLabel: createFormLabelMock(), // Use specialized FormLabel mock
  FormErrorMessage: createMockComponent('FormErrorMessage'),
  FormHelperText: createMockComponent('FormHelperText'),
  Checkbox: createMockComponent('Checkbox'),
  Radio: createRadioMock(), // Use specialized Radio mock
  RadioGroup: createRadioGroupMock(), // Use specialized RadioGroup mock
  
  // Feedback components
  Alert: createAlertMock(), // Use specialized Alert mock
  AlertIcon: createMockComponent('AlertIcon'),
  AlertTitle: createMockComponent('AlertTitle'),
  AlertDescription: createMockComponent('AlertDescription'),
  AlertDialog: createMockComponent('AlertDialog'),
  AlertDialogOverlay: createMockComponent('AlertDialogOverlay'),
  AlertDialogContent: createMockComponent('AlertDialogContent'),
  AlertDialogHeader: createMockComponent('AlertDialogHeader'),
  AlertDialogBody: createMockComponent('AlertDialogBody'),
  AlertDialogFooter: createMockComponent('AlertDialogFooter'),
  Spinner: createSpinnerMock(), // Use specialized Spinner mock
  Progress: createMockComponent('Progress'),
  
  // Navigation components
  Breadcrumb: createMockComponent('Breadcrumb'),
  BreadcrumbItem: createMockComponent('BreadcrumbItem'),
  BreadcrumbLink: createMockComponent('BreadcrumbLink'),
  
  // Data display components
  Card: createMockComponent('Card'),
  CardBody: createMockComponent('CardBody'),
  CardFooter: createMockComponent('CardFooter'),
  CardHeader: createMockComponent('CardHeader'),
  Table: createMockComponent('Table'),
  Thead: createMockComponent('Thead'),
  Tbody: createMockComponent('Tbody'),
  Tr: createMockComponent('Tr'),
  Th: createMockComponent('Th'),
  Td: createMockComponent('Td'),
  Badge: createMockComponent('Badge'),
  Tag: createMockComponent('Tag'),
  
  // Overlay components
  Modal: createMockComponent('Modal'),
  ModalOverlay: createMockComponent('ModalOverlay'),
  ModalContent: createMockComponent('ModalContent'),
  ModalHeader: createMockComponent('ModalHeader'),
  ModalFooter: createMockComponent('ModalFooter'),
  ModalBody: createMockComponent('ModalBody'),
  ModalCloseButton: createMockComponent('ModalCloseButton'),
  Tooltip: createMockComponent('Tooltip'),
  
  // Disclosure components
  Collapse: createMockComponent('Collapse'),
  Accordion: createMockComponent('Accordion'),
  AccordionItem: createMockComponent('AccordionItem'),
  AccordionButton: createMockComponent('AccordionButton'),
  AccordionPanel: createMockComponent('AccordionPanel'),
  AccordionIcon: createMockComponent('AccordionIcon'),
  
  // Other components
  Divider: createMockComponent('Divider'),
  Icon: createMockComponent('Icon'),
  Image: createMockComponent('Image'),
  Avatar: createMockComponent('Avatar'),
  List: createMockComponent('List'),
  ListItem: createMockComponent('ListItem'),
  ListIcon: createMockComponent('ListIcon'),
  Code: createMockComponent('Code'),
  Kbd: createMockComponent('Kbd'),
  Stat: createMockComponent('Stat'),
  StatLabel: createMockComponent('StatLabel'),
  StatNumber: createMockComponent('StatNumber'),
  StatHelpText: createMockComponent('StatHelpText'),
  StatArrow: createMockComponent('StatArrow'),
  StatGroup: createMockComponent('StatGroup'),
  
  // Toast-related components
  Portal: createMockComponent('Portal'),
  Toaster: createMockComponent('Toaster'),
  
  // Toast component with subcomponents
  Toast: {
    Root: createMockComponent('ToastRoot'),
    Indicator: createMockComponent('ToastIndicator'),
    Title: createMockComponent('ToastTitle'),
    Description: createMockComponent('ToastDescription'),
    ActionTrigger: createMockComponent('ToastActionTrigger'),
    CloseTrigger: createMockComponent('ToastCloseTrigger'),
  },
};

module.exports = {
  ...mockComponents,
  ChakraProvider,
  // Export hooks
  useToast,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  createToaster,
  // Export icon mocks
  FaVoteYea,
  FaClock,
  FaQuestionCircle,
  FaExclamationTriangle,
};
