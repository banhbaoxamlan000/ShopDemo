package com.example.Shopee.Validator;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {DobValidator.class})
public @interface DobConstraint {

    String message() default "INVALID DATE OF BIRTH";

    int min();

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
