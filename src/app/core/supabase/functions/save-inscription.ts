// https://cchztsiivmddznqtevrw.supabase.co/functions/v1/save-inscription
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const body = await req.json();
    console.log("Received Inscription Data:", body);

    const {
      childData,
      firstGuardian,
      secondGuardian,
      medicalInfo,
      authorizedPerson,
      authorizations,
      signature,
    } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /* =========================
       1. CHILDREN
    ========================== */
    console.log("Child Data:", childData);
    const { data: child, error: childError } = await supabase
      .from("children")
      .insert({
        full_name: childData.full_name,
        avatar_url: childData.avatar_url,
        birth_date: childData.birth_date,
        gender: childData.gender,
        address: childData.address,
        schedule_id: childData.schedule_id,
      })
      .select()
      .single();

    if (childError) throw childError;

    /* =========================
       2. LEGAL PARENTS
    ========================== */
    const legalParents: any[] = [];

    console.log("First Guardian:", firstGuardian);
    const { data: guardian1, error: g1Error } = await supabase
      .from("legal_parents")
      .insert({
        full_name: firstGuardian.full_name,
        identification_type: firstGuardian.identification_type,
        identification_number: firstGuardian.identification_number,
        phone_number: firstGuardian.phone_number,
        workplace: firstGuardian.workplace,
      })
      .select()
      .single();

    if (g1Error) throw g1Error;

    legalParents.push({ parent: guardian1, is_primary: true });

    console.log("Second Guardian:", secondGuardian);
    if (secondGuardian) {
      const { data: guardian2, error: g2Error } = await supabase
        .from("legal_parents")
        .insert({
          full_name: secondGuardian.full_name,
          identification_type: secondGuardian.identification_type,
          identification_number: secondGuardian.identification_number,
          phone_number: secondGuardian.phone_number,
          workplace: secondGuardian.workplace,
        })
        .select()
        .single();

      if (g2Error) throw g2Error;

      legalParents.push({ parent: guardian2, is_primary: false });
    }

    /* =========================
       3. CHILDREN_LEGAL_PARENTS
    ========================== */
    console.log("Linking Child with Legal Parents", legalParents);
    const relations = legalParents.map((lp) => ({
      children_id: child.id,
      legal_parent_id: lp.parent.id,
      relationship: "Tutor",
      is_primary: lp.is_primary,
    }));

    const { error: relationError } = await supabase
      .from("children_legal_parents")
      .insert(relations);

    if (relationError) throw relationError;

    /* =========================
       4. AUTHORIZED_PICKUP
    ========================== */
    if (authorizedPerson) {
      console.log("Authorized Person:", authorizedPerson);
      const { error: pickupError } = await supabase
        .from("authorized_pickup")
        .insert({
          children_id: child.id,
          full_name: authorizedPerson.full_name,
          phone_number: authorizedPerson.phone_number,
          children_relationship: authorizedPerson.relationship,
        });

      if (pickupError) throw pickupError;
    }

    /* =========================
       5. MEDICAL_INFO
    ========================== */
        console.log("Medical Info:", medicalInfo);
    if (medicalInfo) {
      const { error: medicalError } = await supabase
        .from("medical_info")
        .insert({
          child_id: child.id,
          has_medical_condition: medicalInfo.has_medical_condition,
          medical_condition_details: medicalInfo.medical_condition_details,
          takes_medication: medicalInfo.takes_medication,
          allergies: medicalInfo.allergies,
          preferred_medical_center: medicalInfo.preferred_medical_center,
        });

      if (medicalError) throw medicalError;
    }

    /* =========================
       6. REGISTRATION
    ========================== */
    const { data: registration, error: registrationError } =
      await supabase
        .from("registration")
        .insert({
          children_id: child.id,
          profile_id: signature.profile_id,
          start_date: signature.start_date,
          status: "activo",
        })
        .select()
        .single();

    if (registrationError) throw registrationError;

    /* =========================
       7. TERMS_CONDITION
    ========================== */
    const { error: termsError } = await supabase
      .from("terms_condition")
      .insert({
        registration_id: registration.id,
        post_pictures_social: authorizations.allowSocialMedia,
        accepted_at: signature.signature_date,
      });

    if (termsError) throw termsError;

    return new Response(
      JSON.stringify({
        success: true,
        registration_id: registration.id,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
});
