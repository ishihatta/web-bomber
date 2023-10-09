#[derive(Copy, Clone)]
pub enum FieldObject {
    None, UnbreakableWall, BreakableWall, Bomb, PowerUpItem
}

#[derive(Copy, Clone)]
pub struct FieldElement {
    pub x: i32,
    pub y: i32,
    pub field_object: FieldObject,

    // この場所を通ることのリスク度合い
    pub risk: i32,

    // この場所までの距離
    pub distance: i32,

    // この場所までのコスト
    pub cost: i32,

    // この場所にたどり着くための「前の場所」
    pub previous_element_x: i32,
    pub previous_element_y: i32,

    // いずれ壊されることが確定している場合true
    pub will_broken: bool,
}

impl FieldElement {
    pub fn new(x: i32, y: i32, field_object: FieldObject) -> FieldElement {
        FieldElement {
            x,
            y,
            field_object,
            risk: 0,
            distance: 1000,
            cost: 10000,
            previous_element_x: -1,
            previous_element_y: -1,
            will_broken: false,
        }
    }

    pub fn is_passable(&self) -> bool {
        match self.field_object {
            FieldObject::None | FieldObject::PowerUpItem => true,
            _ => false,
        }
    }
}